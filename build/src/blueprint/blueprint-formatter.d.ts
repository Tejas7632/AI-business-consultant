/**
 * Blueprint Output Formatter — Saves blueprints to disk as Markdown and/or JSON
 */
import type { StartupBlueprint } from "./blueprint-types.js";
export interface SavedBlueprint {
    blueprintId: string;
    markdownPath?: string;
    jsonPath?: string;
    savedAt: string;
}
export declare class BlueprintFormatter {
    private readonly outputDir;
    constructor();
    /**
     * Save blueprint to disk based on configured OUTPUT_FORMAT
     */
    save(blueprint: StartupBlueprint): Promise<SavedBlueprint>;
    /**
     * Print a summary of the blueprint to the console
     */
    printSummary(blueprint: StartupBlueprint): void;
}
//# sourceMappingURL=blueprint-formatter.d.ts.map