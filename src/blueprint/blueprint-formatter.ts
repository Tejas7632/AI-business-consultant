/**
 * Blueprint Output Formatter — Saves blueprints to disk as Markdown and/or JSON
 */

import fs from "fs";
import path from "path";
import type { StartupBlueprint } from "./blueprint-types.js";
import { config } from "../config/watsonx-config.js";
import { logger } from "../utils/logger.js";

export interface SavedBlueprint {
  blueprintId: string;
  markdownPath?: string;
  jsonPath?: string;
  savedAt: string;
}

export class BlueprintFormatter {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = config.OUTPUT_DIR;
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Save blueprint to disk based on configured OUTPUT_FORMAT
   */
  async save(blueprint: StartupBlueprint): Promise<SavedBlueprint> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    const slug = blueprint.startupIdea
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 40);

    const baseName = `blueprint-${slug}-${timestamp}`;
    const result: SavedBlueprint = {
      blueprintId: blueprint.id,
      savedAt: new Date().toISOString(),
    };

    if (config.OUTPUT_FORMAT === "markdown" || config.OUTPUT_FORMAT === "both") {
      const mdPath = path.join(this.outputDir, `${baseName}.md`);
      fs.writeFileSync(mdPath, blueprint.markdownReport, "utf-8");
      result.markdownPath = mdPath;
      logger.info(`📄 Markdown blueprint saved: ${mdPath}`);
    }

    if (config.OUTPUT_FORMAT === "json" || config.OUTPUT_FORMAT === "both") {
      const jsonPath = path.join(this.outputDir, `${baseName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(blueprint, null, 2), "utf-8");
      result.jsonPath = jsonPath;
      logger.info(`📦 JSON blueprint saved: ${jsonPath}`);
    }

    return result;
  }

  /**
   * Print a summary of the blueprint to the console
   */
  printSummary(blueprint: StartupBlueprint): void {
    const lines = [
      "",
      "═══════════════════════════════════════════════════════════",
      "  🚀  STARTUP BLUEPRINT GENERATION COMPLETE",
      "═══════════════════════════════════════════════════════════",
      `  Blueprint ID    : ${blueprint.id}`,
      `  Startup Idea    : ${blueprint.startupIdea.substring(0, 60)}`,
      `  Industry        : ${blueprint.industry}`,
      `  Geography       : ${blueprint.geography}`,
      `  Model Used      : ${blueprint.modelUsed}`,
      `  Sections        : 12 sections generated`,
      `  Total Tokens    : ~${blueprint.totalTokensUsed.toLocaleString()}`,
      `  Duration        : ${(blueprint.generationDurationMs / 1000).toFixed(1)}s`,
      `  Generated At    : ${new Date(blueprint.generatedAt).toLocaleString()}`,
      "═══════════════════════════════════════════════════════════",
      "",
    ];
    console.log(lines.join("\n"));
  }
}
