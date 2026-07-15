/**
 * Blueprint Types — Shared TypeScript interfaces for the startup blueprint
 */
export interface StartupInput {
    idea: string;
    industry?: string;
    targetGeography?: string;
    stage?: "idea" | "mvp" | "early-revenue" | "growth";
    founderBackground?: string;
    problemStatement?: string;
    existingTraction?: string;
    fundingStage?: "bootstrapped" | "pre-seed" | "seed" | "series-a";
    additionalContext?: string;
}
export interface BlueprintSection {
    id: string;
    title: string;
    content: string;
    ragSourcesUsed: string[];
    wordCount: number;
    generatedAt: string;
}
export interface BusinessModelCanvasItem {
    customerSegments: string;
    valuePropositions: string;
    channels: string;
    customerRelationships: string;
    revenueStreams: string;
    keyResources: string;
    keyActivities: string;
    keyPartnerships: string;
    costStructure: string;
}
export interface CompetitorEntry {
    name: string;
    website: string;
    positioning: string;
    strengths: string;
    weaknesses: string;
    fundingStage: string;
    differentiator: string;
}
export interface RiskEntry {
    category: string;
    description: string;
    probability: "High" | "Medium" | "Low";
    impact: "High" | "Medium" | "Low";
    score: string;
    mitigation: string;
}
export interface RoadmapMilestone {
    phase: string;
    period: string;
    keyMilestones: string[];
    teamHires: string[];
    productGoals: string[];
    revenueTarget: string;
    fundingGoal: string;
}
export interface StartupBlueprint {
    id: string;
    version: string;
    generatedAt: string;
    modelUsed: string;
    startupIdea: string;
    industry: string;
    geography: string;
    executiveSummary: BlueprintSection;
    businessModelCanvas: BlueprintSection;
    targetMarket: BlueprintSection;
    competitorAnalysis: BlueprintSection;
    revenueModel: BlueprintSection;
    estimatedBudget: BlueprintSection;
    goToMarketStrategy: BlueprintSection;
    fundingOpportunities: BlueprintSection;
    governmentSchemes: BlueprintSection;
    legalConsiderations: BlueprintSection;
    riskAssessment: BlueprintSection;
    implementationRoadmap: BlueprintSection;
    markdownReport: string;
    disclaimer: string;
    totalTokensUsed: number;
    generationDurationMs: number;
}
export interface BlueprintGenerationProgress {
    currentSection: string;
    completedSections: number;
    totalSections: number;
    percentComplete: number;
    estimatedRemainingSeconds: number;
}
//# sourceMappingURL=blueprint-types.d.ts.map