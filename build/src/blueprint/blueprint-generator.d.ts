/**
 * Blueprint Generator — Core section generation engine
 * Uses IBM Granite via watsonx.ai + RAG context to generate each section
 */
import { RAGEngine } from "../rag/rag-engine.js";
import type { StartupInput, BlueprintSection, StartupBlueprint, BlueprintGenerationProgress } from "./blueprint-types.js";
export declare class BlueprintGenerator {
    private readonly ragEngine;
    private progressCallback?;
    constructor(ragEngine: RAGEngine);
    onProgress(callback: (progress: BlueprintGenerationProgress) => void): void;
    private updateProgress;
    /**
     * Generate a single blueprint section using RAG + IBM Granite
     */
    generateSection(sectionKey: string, input: StartupInput): Promise<BlueprintSection>;
    /**
     * Generate the complete startup blueprint
     */
    generateBlueprint(input: StartupInput): Promise<StartupBlueprint>;
    /**
     * Assemble the final Markdown report from all generated sections
     */
    private assembleMarkdownReport;
}
//# sourceMappingURL=blueprint-generator.d.ts.map