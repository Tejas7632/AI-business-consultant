/**
 * Web Server Entry Point
 * Starts the Express server — completely separate from src/index.ts (CLI entry).
 *
 * Run:
 *   Development : npm run dev:web
 *   Production  : npm run start:web
 */

import { createApp } from "./server.js";
import { logger } from "../utils/logger.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = createApp();

app.listen(PORT, () => {
  logger.info("═══════════════════════════════════════════════════════════");
  logger.info("  IBM watsonx Startup Blueprint Generator — Web Server");
  logger.info("═══════════════════════════════════════════════════════════");
  logger.info(`  Local   : http://localhost:${PORT}`);
  logger.info(`  API     : http://localhost:${PORT}/api`);
  logger.info(`  Health  : http://localhost:${PORT}/api/health`);
  logger.info("═══════════════════════════════════════════════════════════");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully.");
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});
