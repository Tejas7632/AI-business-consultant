/**
 * Startup Blueprint Orchestrator Agent
 * IBM watsonx Orchestrate — Top-level agent that manages the full blueprint pipeline:
 *   1. Validates and enriches startup input
 *   2. Initializes RAG engine
 *   3. Orchestrates section generation via IBM Granite
 *   4. Saves and returns the complete blueprint
 */
import type { StartupInput, StartupBlueprint, BlueprintSection, BlueprintGenerationProgress } from "../blueprint/blueprint-types.js";
type AgentStatus = "idle" | "initializing" | "generating" | "saving" | "done" | "error";
export interface AgentSession {
    sessionId: string;
    startTime: Date;
    status: AgentStatus;
    input?: StartupInput;
    blueprint?: StartupBlueprint;
    error?: string;
    savedPaths?: {
        markdown?: string;
        json?: string;
    };
}
export declare class StartupBlueprintAgent {
    private readonly ragEngine;
    private readonly generator;
    private readonly formatter;
    private isInitialized;
    private progressCallback?;
    constructor();
    onProgress(callback: (progress: BlueprintGenerationProgress) => void): void;
    /**
     * Initialize the agent: validate IBM credentials, warm up RAG engine
     */
    initialize(): Promise<void>;
    /**
     * Validate and enrich the startup input
     */
    private validateInput;
    /**
     * Run the full blueprint generation pipeline
     */
    run(input: StartupInput): Promise<AgentSession>;
    /**
     * Regenerate a specific section of an existing blueprint
     */
    regenerateSection(sectionKey: string, input: StartupInput): Promise<{
        section: BlueprintSection;
    }>;
}
export {};
//# sourceMappingURL=orchestrator-agent.d.ts.map