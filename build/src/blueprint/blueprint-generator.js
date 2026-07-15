/**
 * Blueprint Generator — Core section generation engine
 * Uses IBM Granite via watsonx.ai + RAG context to generate each section
 */
import { watsonxClient } from "../tools/watsonx-client.js";
import { AGENT_INSTRUCTIONS } from "../config/agent-instructions.js";
import { logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/watsonx-config.js";
// ── Section-Domain Mapping ────────────────────────────────────────────────────
const SECTION_DOMAIN_MAP = {
    executiveSummary: ["market-research", "revenue-models"],
    businessModelCanvas: ["revenue-models", "market-research"],
    targetMarket: ["market-research"],
    competitorAnalysis: ["competitor-analysis"],
    revenueModel: ["revenue-models"],
    estimatedBudget: ["revenue-models", "funding-options"],
    goToMarketStrategy: ["go-to-market"],
    fundingOpportunities: ["funding-options", "startup-incubators"],
    governmentSchemes: ["government-schemes"],
    legalConsiderations: ["legal-requirements"],
    riskAssessment: ["risk-management"],
    implementationRoadmap: ["go-to-market", "revenue-models"],
};
const SECTION_TITLES = {
    executiveSummary: "Executive Summary",
    businessModelCanvas: "Business Model Canvas",
    targetMarket: "Target Market Analysis",
    competitorAnalysis: "Competitor Analysis",
    revenueModel: "Revenue Model",
    estimatedBudget: "Estimated Budget & Financial Projections",
    goToMarketStrategy: "Go-to-Market Strategy",
    fundingOpportunities: "Funding & Investor Opportunities",
    governmentSchemes: "Government Schemes & Incentives",
    legalConsiderations: "Legal Considerations & Compliance",
    riskAssessment: "Risk Assessment Matrix",
    implementationRoadmap: "Implementation Roadmap",
};
// ── Prompt Builder ─────────────────────────────────────────────────────────────
function buildSectionPrompt(sectionKey, input, ragContext) {
    const sectionPrompt = AGENT_INSTRUCTIONS.SECTION_PROMPTS[sectionKey];
    const systemPrompt = AGENT_INSTRUCTIONS.SYSTEM_PROMPT;
    const geography = input.targetGeography || "Global";
    const industry = input.industry || "Technology";
    const contextBlock = ragContext
        ? `<context>
The following information was retrieved from the knowledge base to inform this section:

${ragContext}

</context>

`
        : "";
    return `${systemPrompt}

STARTUP INFORMATION:
- Idea: ${input.idea}
- Industry: ${industry}
- Target Geography: ${geography}
- Stage: ${input.stage || "idea"}
${input.founderBackground ? `- Founder Background: ${input.founderBackground}` : ""}
${input.problemStatement ? `- Problem Statement: ${input.problemStatement}` : ""}
${input.existingTraction ? `- Existing Traction: ${input.existingTraction}` : ""}
${input.fundingStage ? `- Current Funding Stage: ${input.fundingStage}` : ""}
${input.additionalContext ? `- Additional Context: ${input.additionalContext}` : ""}

${contextBlock}TASK:
${sectionPrompt}

Write the "${SECTION_TITLES[sectionKey]}" section of the Startup Blueprint for the above startup.
Be specific to the startup's industry (${industry}) and geography (${geography}).
Format in clean Markdown with appropriate subheadings, bullet points, and tables where relevant.
End with 3-5 specific "Next Steps" the founder can take within the next 30 days.

### ${SECTION_TITLES[sectionKey]}
`;
}
// ── Blueprint Generator Class ──────────────────────────────────────────────────
export class BlueprintGenerator {
    ragEngine;
    progressCallback;
    constructor(ragEngine) {
        this.ragEngine = ragEngine;
    }
    onProgress(callback) {
        this.progressCallback = callback;
    }
    updateProgress(currentSection, completed, total, startTime) {
        if (!this.progressCallback)
            return;
        const elapsed = Date.now() - startTime;
        const avgPerSection = completed > 0 ? elapsed / completed : 15_000;
        const remaining = (total - completed) * avgPerSection;
        this.progressCallback({
            currentSection,
            completedSections: completed,
            totalSections: total,
            percentComplete: Math.round((completed / total) * 100),
            estimatedRemainingSeconds: Math.round(remaining / 1000),
        });
    }
    /**
     * Generate a single blueprint section using RAG + IBM Granite
     */
    async generateSection(sectionKey, input) {
        const startTime = Date.now();
        logger.info(`Generating section: ${SECTION_TITLES[sectionKey]}`);
        // Retrieve RAG context from relevant knowledge domains
        const domains = SECTION_DOMAIN_MAP[sectionKey] || ["market-research"];
        const query = `${input.idea} ${input.industry || ""} ${SECTION_TITLES[sectionKey]}`;
        let ragContext = "";
        const ragSources = [];
        try {
            const ragContextMap = await this.ragEngine.retrieveMultiDomain(query, domains);
            const allChunks = Array.from(ragContextMap.values()).flatMap((ctx) => ctx.chunks);
            // Deduplicate and take top-K
            const uniqueChunks = allChunks
                .filter((chunk, idx, arr) => arr.findIndex((c) => c.id === chunk.id) === idx)
                .sort((a, b) => b.score - a.score)
                .slice(0, config.RAG_TOP_K);
            ragContext = uniqueChunks
                .map((c, i) => `[${i + 1}] ${c.title} (${c.domain})\n${c.content.substring(0, 800)}`)
                .join("\n\n---\n\n");
            ragSources.push(...uniqueChunks.map((c) => `${c.title} [${c.source || c.domain}]`));
        }
        catch (err) {
            logger.warn(`RAG retrieval failed for section ${sectionKey}: ${err}`);
        }
        // Build prompt and call IBM Granite
        const prompt = buildSectionPrompt(sectionKey, input, ragContext);
        const response = await watsonxClient.generate({
            prompt,
            maxNewTokens: 1500,
            temperature: config.AGENT_TEMPERATURE,
        });
        const content = response.generatedText.trim();
        const wordCount = content.split(/\s+/).length;
        logger.info(`Section "${SECTION_TITLES[sectionKey]}" generated — ${wordCount} words in ${Date.now() - startTime}ms`);
        return {
            id: sectionKey,
            title: SECTION_TITLES[sectionKey],
            content,
            ragSourcesUsed: ragSources,
            wordCount,
            generatedAt: new Date().toISOString(),
        };
    }
    /**
     * Generate the complete startup blueprint
     */
    async generateBlueprint(input) {
        const blueprintId = uuidv4();
        const startTime = Date.now();
        logger.info(`\n🚀 Starting Startup Blueprint generation for: "${input.idea}"\n`);
        // Get enabled sections in order
        const enabledSections = Object.entries(AGENT_INSTRUCTIONS.SCOPE.sections)
            .filter(([, cfg]) => cfg.enabled)
            .sort(([, a], [, b]) => a.order - b.order)
            .map(([key]) => key);
        const totalSections = enabledSections.length;
        let completedSections = 0;
        let totalTokensUsed = 0;
        this.updateProgress("Initializing...", 0, totalSections, startTime);
        // Generate each section sequentially (preserves context flow)
        const sections = {};
        for (const sectionKey of enabledSections) {
            this.updateProgress(SECTION_TITLES[sectionKey], completedSections, totalSections, startTime);
            const section = await this.generateSection(sectionKey, input);
            sections[sectionKey] = section;
            completedSections++;
            totalTokensUsed += section.wordCount * 1.3; // Approximate token estimate
        }
        this.updateProgress("Assembling blueprint...", totalSections, totalSections, startTime);
        // Assemble the complete Markdown report
        const markdownReport = this.assembleMarkdownReport(input, sections, blueprintId);
        const generationDurationMs = Date.now() - startTime;
        logger.info(`\n✅ Blueprint generated in ${(generationDurationMs / 1000).toFixed(1)}s — ${totalSections} sections\n`);
        return {
            id: blueprintId,
            version: "1.0.0",
            generatedAt: new Date().toISOString(),
            modelUsed: config.GRANITE_MODEL_ID,
            startupIdea: input.idea,
            industry: input.industry || "Technology",
            geography: input.targetGeography || "Global",
            // Non-null assertions are safe: all 12 keys come from AGENT_INSTRUCTIONS.SCOPE.sections
            executiveSummary: sections["executiveSummary"],
            businessModelCanvas: sections["businessModelCanvas"],
            targetMarket: sections["targetMarket"],
            competitorAnalysis: sections["competitorAnalysis"],
            revenueModel: sections["revenueModel"],
            estimatedBudget: sections["estimatedBudget"],
            goToMarketStrategy: sections["goToMarketStrategy"],
            fundingOpportunities: sections["fundingOpportunities"],
            governmentSchemes: sections["governmentSchemes"],
            legalConsiderations: sections["legalConsiderations"],
            riskAssessment: sections["riskAssessment"],
            implementationRoadmap: sections["implementationRoadmap"],
            markdownReport,
            disclaimer: [
                AGENT_INSTRUCTIONS.CONSTRAINTS.disclaimers.general,
                AGENT_INSTRUCTIONS.CONSTRAINTS.disclaimers.financial,
                AGENT_INSTRUCTIONS.CONSTRAINTS.disclaimers.legal,
            ].join(" "),
            totalTokensUsed: Math.round(totalTokensUsed),
            generationDurationMs,
        };
    }
    /**
     * Assemble the final Markdown report from all generated sections
     */
    assembleMarkdownReport(input, sections, blueprintId) {
        const now = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
        const ideaTitle = input.idea.substring(0, 60) + (input.idea.length > 60 ? "..." : "");
        const toc = Object.values(sections)
            .map((s, i) => `${i + 1}. [${s.title}](#${s.id.toLowerCase()})`)
            .join("\n");
        const sectionBodies = Object.values(sections)
            .map((section) => {
            const sourcesNote = section.ragSourcesUsed.length > 0
                ? `\n\n> 📚 **Sources used:** ${section.ragSourcesUsed.slice(0, 3).join(", ")}`
                : "";
            return `---\n\n## ${section.title} {#${section.id.toLowerCase()}}\n\n${section.content}${sourcesNote}`;
        })
            .join("\n\n");
        return `# 🚀 Startup Blueprint: ${ideaTitle}

> **Generated by IBM watsonx Orchestrate + IBM Granite AI**  
> Blueprint ID: \`${blueprintId}\`  
> Industry: **${input.industry || "Technology"}** | Geography: **${input.targetGeography || "Global"}**  
> Generated: ${now}

---

## Table of Contents

${toc}

---

${sectionBodies}

---

## ⚠️ Disclaimers

> ${AGENT_INSTRUCTIONS.CONSTRAINTS.disclaimers.general}
> 
> ${AGENT_INSTRUCTIONS.CONSTRAINTS.disclaimers.financial}
> 
> ${AGENT_INSTRUCTIONS.CONSTRAINTS.disclaimers.legal}

---

*This blueprint was generated using IBM watsonx Orchestrate with IBM Granite language models 
and Retrieval-Augmented Generation (RAG). Model: \`${config.GRANITE_MODEL_ID}\`.*
`;
    }
}
//# sourceMappingURL=blueprint-generator.js.map