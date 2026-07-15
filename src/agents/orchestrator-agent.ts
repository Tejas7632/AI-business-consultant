/**
 * Startup Blueprint Orchestrator Agent
 * IBM watsonx Orchestrate — Top-level agent that manages the full blueprint pipeline:
 *   1. Validates and enriches startup input
 *   2. Initializes RAG engine
 *   3. Orchestrates section generation via IBM Granite
 *   4. Saves and returns the complete blueprint
 */
import { config } from "../config/watsonx-config.js";
import { RAGEngine } from "../rag/rag-engine.js";
import { BlueprintGenerator } from "../blueprint/blueprint-generator.js";
import { BlueprintFormatter } from "../blueprint/blueprint-formatter.js";
import { watsonxClient } from "../tools/watsonx-client.js";
import { AGENT_INSTRUCTIONS } from "../config/agent-instructions.js";
import { FEATURES } from "../config/watsonx-config.js";
import { logger } from "../utils/logger.js";
import type {
  StartupInput,
  StartupBlueprint,
  BlueprintSection,
  BlueprintGenerationProgress,
} from "../blueprint/blueprint-types.js";

// ── Agent State ───────────────────────────────────────────────────────────────
type AgentStatus = "idle" | "initializing" | "generating" | "saving" | "done" | "error";

export interface AgentSession {
  sessionId: string;
  startTime: Date;
  status: AgentStatus;
  input?: StartupInput;
  blueprint?: StartupBlueprint;
  error?: string;
  savedPaths?: { markdown?: string; json?: string };
}

// ── Orchestrator Agent ────────────────────────────────────────────────────────
export class StartupBlueprintAgent {
  private readonly ragEngine: RAGEngine;
  private readonly generator: BlueprintGenerator;
  private readonly formatter: BlueprintFormatter;
  private isInitialized = false;
  private progressCallback?: (progress: BlueprintGenerationProgress) => void;

  constructor() {
    this.ragEngine = new RAGEngine();
    this.generator = new BlueprintGenerator(this.ragEngine);
    this.formatter = new BlueprintFormatter();
  }

  onProgress(callback: (progress: BlueprintGenerationProgress) => void): void {
    this.progressCallback = callback;
    this.generator.onProgress(callback);
  }

  /**
   * Initialize the agent: validate IBM credentials, warm up RAG engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info("Initializing Startup Blueprint Agent...");
    logger.info(`  Persona  : ${AGENT_INSTRUCTIONS.PERSONA.name} (${AGENT_INSTRUCTIONS.PERSONA.role})`);
    logger.info(`  Model    : ${config.GRANITE_MODEL_ID}`);
    logger.info(`  RAG Mode : ${FEATURES.useWatsonDiscovery ? "Watson Discovery" : "In-Memory Store"}`);

    // 1. Validate IBM watsonx connectivity
    const health = await watsonxClient.healthCheck();
    if (health.status === "error") {
      throw new Error(`IBM watsonx.ai connectivity failed: ${health.message}\nCheck your WATSONX_API_KEY and WATSONX_PROJECT_ID in .env`);
    }
    logger.info(`  watsonx  : ✅ ${health.message}`);

    // 2. Initialize RAG knowledge base
    await this.ragEngine.initialize();
    logger.info(`  RAG      : ✅ Knowledge base ready`);

    this.isInitialized = true;
    logger.info("Agent initialized successfully.\n");
  }

  /**
   * Validate and enrich the startup input
   */
  private validateInput(input: StartupInput): StartupInput {
    if (!input.idea || input.idea.trim().length < 10) {
      throw new Error("Startup idea must be at least 10 characters long.");
    }
    if (input.idea.length > 2000) {
      throw new Error("Startup idea description exceeds 2000 characters.");
    }

    return {
      ...input,
      idea: input.idea.trim(),
      industry: input.industry?.trim() || "Technology",
      targetGeography: input.targetGeography?.trim() || "Global",
      stage: input.stage || "idea",
      fundingStage: input.fundingStage || "pre-seed",
    };
  }

  /**
   * Run the full blueprint generation pipeline
   */
  async run(input: StartupInput): Promise<AgentSession> {
    const sessionId = `session-${Date.now()}`;

    const session: AgentSession = {
      sessionId,
      startTime: new Date(),
      status: "initializing",
      input,
    };

    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate input
      session.input = this.validateInput(input);
      session.status = "generating";

      // Generate blueprint
      const blueprint = await this.generator.generateBlueprint(session.input);
      session.blueprint = blueprint;
      session.status = "saving";

      // Save outputs
      const saved = await this.formatter.save(blueprint);
      session.savedPaths = {
        markdown: saved.markdownPath,
        json: saved.jsonPath,
      };

      // Print summary
      this.formatter.printSummary(blueprint);

      session.status = "done";
    } catch (error) {
      session.status = "error";
      session.error = error instanceof Error ? error.message : String(error);
      logger.error(`Blueprint generation failed: ${session.error}`);
      throw error;
    }

    return session;
  }

  /**
   * Regenerate a specific section of an existing blueprint
   */
  async regenerateSection(
    sectionKey: string,
    input: StartupInput
  ): Promise<{ section: BlueprintSection }> {
    if (!this.isInitialized) await this.initialize();
    const validInput = this.validateInput(input);
    const section = await this.generator.generateSection(sectionKey, validInput);
    return { section };
  }
}
