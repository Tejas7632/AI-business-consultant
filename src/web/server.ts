/**
 * Express HTTP Server — Web layer for the Startup Blueprint Agent
 *
 * Routes:
 *   GET  /              → Serves public/index.html
 *   GET  /api/health    → watsonx.ai connectivity check
 *   POST /api/generate  → Submit startup input, returns SSE stream of progress + result
 *   POST /api/section   → Regenerate a single blueprint section
 *
 * The CLI backend (agents/, rag/, blueprint/, tools/) is NOT modified.
 * This file is the only web-specific addition.
 */

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { StartupBlueprintAgent } from "../agents/orchestrator-agent.js";
import { watsonxClient } from "../tools/watsonx-client.js";
import { logger } from "../utils/logger.js";
import type { StartupInput } from "../blueprint/blueprint-types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

// ── In-memory job store ────────────────────────────────────────────────────────
// Maps jobId → completed blueprint JSON (kept for 30 min then evicted)
const jobResults = new Map<string, { blueprint: unknown; error?: string; doneAt: number }>();
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, v] of jobResults) {
    if (v.doneAt < cutoff) jobResults.delete(id);
  }
}, 5 * 60 * 1000);

// ── App ────────────────────────────────────────────────────────────────────────
export function createApp() {
  const app = express();

  // Security & parsing
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],   // inline scripts needed for the SPA
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", "data:"],
          imgSrc: ["'self'", "data:"],
        },
      },
    })
  );
  app.use(cors());
  app.use(express.json({ limit: "64kb" }));

  // Static files
  app.use(express.static(PUBLIC_DIR));

  // ── GET /api/health ──────────────────────────────────────────────────────────
  app.get("/api/health", async (_req: Request, res: Response) => {
    try {
      const result = await watsonxClient.healthCheck();
      res.json({ status: result.status, message: result.message, timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(503).json({ status: "error", message: String(err) });
    }
  });

  // ── POST /api/generate  (Server-Sent Events streaming) ──────────────────────
  //
  // Blueprint generation takes 1-3 min across 12 sections. Rather than a single
  // blocking HTTP response that would time out, we use SSE: the client opens a
  // long-lived GET connection and receives progress events, then the full result.
  //
  // Flow:
  //   1. Client POSTs { input: StartupInput } → receives { jobId }
  //   2. Client opens GET /api/generate/stream/:jobId (SSE)
  //   3. Server fires "progress" events as each section completes
  //   4. Server fires "done" event with the full blueprint JSON
  //   5. Client closes the SSE connection
  app.post("/api/generate", (req: Request, res: Response) => {
    const input = req.body?.input as StartupInput | undefined;
    if (!input?.idea || input.idea.trim().length < 10) {
      res.status(400).json({ error: "Field 'input.idea' is required (min 10 characters)." });
      return;
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    res.json({ jobId });

    // Run asynchronously — do not await
    void runGenerationJob(jobId, input);
  });

  app.get("/api/generate/stream/:jobId", (req: Request, res: Response) => {
    const { jobId } = req.params;

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // If the job already finished before the SSE client connected, send result now
    const existing = jobResults.get(jobId);
    if (existing) {
      if (existing.error) {
        send("error", { message: existing.error });
      } else {
        send("done", { blueprint: existing.blueprint });
      }
      res.end();
      return;
    }

    // Otherwise register a listener that polls every 200ms until result arrives
    // (simple approach — no EventEmitter complexity needed)
    const interval = setInterval(() => {
      const result = jobResults.get(jobId);
      if (!result) return;
      clearInterval(interval);
      if (result.error) {
        send("error", { message: result.error });
      } else {
        send("done", { blueprint: result.blueprint });
      }
      res.end();
    }, 200);

    // Also relay live progress from the agent via a global progress registry
    const progressKey = `progress:${jobId}`;
    const progressInterval = setInterval(() => {
      const evt = progressRegistry.get(progressKey);
      if (!evt) return;
      progressRegistry.delete(progressKey);
      send("progress", evt);
    }, 300);

    req.on("close", () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    });
  });

  // ── POST /api/section  (regenerate a single section) ────────────────────────
  app.post("/api/section", async (req: Request, res: Response) => {
    const { sectionKey, input } = req.body as { sectionKey: string; input: StartupInput };
    if (!sectionKey || !input?.idea) {
      res.status(400).json({ error: "Fields 'sectionKey' and 'input.idea' are required." });
      return;
    }
    try {
      const agent = new StartupBlueprintAgent();
      const { section } = await agent.regenerateSection(sectionKey, input);
      res.json({ section });
    } catch (err) {
      logger.error(`Section regeneration error: ${err}`);
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ── SPA fallback ─────────────────────────────────────────────────────────────
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });

  // ── Global error handler ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  });

  return app;
}

// ── Progress registry (shared between job runner and SSE handler) ─────────────
const progressRegistry = new Map<string, unknown>();

async function runGenerationJob(jobId: string, input: StartupInput): Promise<void> {
  const agent = new StartupBlueprintAgent();

  agent.onProgress((progress) => {
    progressRegistry.set(`progress:${jobId}`, progress);
    logger.debug(`[${jobId}] ${progress.percentComplete}% — ${progress.currentSection}`);
  });

  try {
    const session = await agent.run(input);
    jobResults.set(jobId, {
      blueprint: session.blueprint,
      doneAt: Date.now(),
    });
    logger.info(`[${jobId}] Blueprint generation complete.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    jobResults.set(jobId, { blueprint: null, error: message, doneAt: Date.now() });
    logger.error(`[${jobId}] Generation failed: ${message}`);
  }
}
