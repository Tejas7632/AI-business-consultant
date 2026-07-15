/**
 * Startup Blueprint Orchestrator Agent
 * IBM watsonx Orchestrate — Top-level agent that manages the full blueprint pipeline:
 *   1. Validates and enriches startup input
 *   2. Initializes RAG engine
 *   3. Orchestrates section generation via IBM Granite
 *   4. Saves and returns the complete blueprint
 */
import { RAGEngine } from "../rag/rag-engine.js";
import { BlueprintGenerator } from "../blueprint/blueprint-generator.js";
import { BlueprintFormatter } from "../blueprint/blueprint-formatter.js";
import { watsonxClient } from "../tools/watsonx-client.js";
import { AGENT_INSTRUCTIONS } from "../config/agent-instructions.js";
import { FEATURES } from "../config/watsonx-config.js";
import { logger } from "../utils/logger.js";
// ── Orchestrator Agent ────────────────────────────────────────────────────────
export class StartupBlueprintAgent {
    ragEngine;
    generator;
    formatter;
    isInitialized = false;
    progressCallback;
    constructor() {
        this.ragEngine = new RAGEngine();
        this.generator = new BlueprintGenerator(this.ragEngine);
        this.formatter = new BlueprintFormatter();
    }
    onProgress(callback) {
        this.progressCallback = callback;
        this.generator.onProgress(callback);
    }
    /**
     * Initialize the agent: validate IBM credentials, warm up RAG engine
     */
    async initialize() {
        if (this.isInitialized)
            return;
        logger.info("Initializing Startup Blueprint Agent...");
        logger.info(`  Persona  : ${AGENT_INSTRUCTIONS.PERSONA.name} (${AGENT_INSTRUCTIONS.PERSONA.role})`);
        logger.info(`  Model    : ${process.env.GRANITE_MODEL_ID ?? "ibm/granite-13b-instruct-v2"}`);
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
    validateInput(input) {
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
    async run(input) {
        const sessionId = `session-${Date.now()}`;
        const session = {
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
        }
        catch (error) {
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
    async regenerateSection(sectionKey, input) {
        if (!this.isInitialized)
            await this.initialize();
        const validInput = this.validateInput(input);
        const section = await this.generator.generateSection(sectionKey, validInput);
        return { section };
    }
}
//# sourceMappingURL=orchestrator-agent.js.map