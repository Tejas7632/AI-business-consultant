#!/usr/bin/env node
/**
 * ============================================================================
 * IBM watsonx Startup Blueprint Generator Agent — Entry Point
 * ============================================================================
 * 
 * Usage:
 *   npm run dev                          → Interactive CLI
 *   node build/index.js generate         → Interactive mode
 *   node build/index.js quick -i "idea"  → Non-interactive mode
 *   node build/index.js health           → Check IBM watsonx connectivity
 * 
 * Programmatic API:
 *   import { StartupBlueprintAgent } from './agents/orchestrator-agent.js'
 *   const agent = new StartupBlueprintAgent()
 *   await agent.initialize()
 *   const session = await agent.run({ idea: "AI-powered HR platform", ... })
 * ============================================================================
 */

import program from "./cli.js";

// Parse and execute CLI commands
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// ── Programmatic API Exports ──────────────────────────────────────────────────
export { StartupBlueprintAgent } from "./agents/orchestrator-agent.js";
export { RAGEngine } from "./rag/rag-engine.js";
export { WatsonxClient } from "./tools/watsonx-client.js";
export { BlueprintGenerator } from "./blueprint/blueprint-generator.js";
export { AGENT_INSTRUCTIONS } from "./config/agent-instructions.js";
export type { StartupInput, StartupBlueprint, BlueprintSection } from "./blueprint/blueprint-types.js";
