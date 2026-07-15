/**
 * Example: Programmatic API usage — Generate a blueprint without the CLI
 * 
 * Run: npx tsx examples/generate-blueprint.ts
 */

import { StartupBlueprintAgent } from "../src/agents/orchestrator-agent.js";
import type { StartupInput } from "../src/blueprint/blueprint-types.js";

// ── Example 1: FinTech Startup (India) ────────────────────────────────────────
const finTechStartup: StartupInput = {
  idea: `An AI-powered personal finance management app for Indian millennials that 
    automatically categorizes spending, tracks investments across UPI/stocks/mutual funds, 
    predicts cash flow, and provides personalized savings recommendations using 
    IBM Granite models. Integrates with UPI, Net Banking, and SEBI-registered brokers.`,
  industry: "FinTech",
  targetGeography: "India",
  stage: "mvp",
  fundingStage: "pre-seed",
  problemStatement: `90% of Indian millennials have no visibility into their true financial 
    health across fragmented UPI apps, bank accounts, and investment platforms. 
    Existing apps are complex and don't understand Indian financial behavior patterns.`,
  founderBackground: `Ex-Goldman Sachs analyst with 5 years in personal finance + 
    IIT Bombay CS graduate with ML expertise`,
  existingTraction: "500 beta users, 4.7/5 app store rating, ₹0 revenue (pre-launch)",
  additionalContext: "Already registered as DPIIT Startup. Planning to raise ₹2 Cr pre-seed.",
};

// ── Example 2: HealthTech Startup (USA) ──────────────────────────────────────
const healthTechStartup: StartupInput = {
  idea: `A B2B SaaS platform for remote patient monitoring that uses AI to analyze 
    wearable device data (Apple Watch, Fitbit, Oura Ring) and alert healthcare 
    providers to early deterioration signals for chronic disease patients, 
    reducing hospital readmissions by 40%.`,
  industry: "HealthTech",
  targetGeography: "USA",
  stage: "mvp",
  fundingStage: "seed",
  problemStatement: "Hospital readmission costs the US healthcare system $26B annually. Current RPM solutions generate alert fatigue with >85% false positive rates.",
  founderBackground: "MD-MBA with 8 years clinical experience + ML engineer with FDA clearance experience",
  existingTraction: "2 hospital pilot agreements signed, 150 patients monitored, IRB approval obtained",
};

// ── Run Generator ─────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀 IBM watsonx Startup Blueprint Generator — Example Run\n");

  const agent = new StartupBlueprintAgent();

  // Show real-time progress
  agent.onProgress((progress) => {
    const bar = "█".repeat(Math.floor(progress.percentComplete / 5)) +
                "░".repeat(20 - Math.floor(progress.percentComplete / 5));
    process.stdout.write(
      `\r  [${bar}] ${progress.percentComplete}% — ${progress.currentSection.padEnd(40)}`
    );
    if (progress.percentComplete === 100) process.stdout.write("\n");
  });

  try {
    // Change to healthTechStartup to test the US example
    const session = await agent.run(finTechStartup);

    console.log(`\n✅ Session: ${session.sessionId}`);
    console.log(`📄 Saved to: ${session.savedPaths?.markdown ?? "N/A"}`);
    console.log(`📦 JSON at:  ${session.savedPaths?.json ?? "N/A"}`);

    // Access individual sections programmatically
    if (session.blueprint) {
      console.log("\n📋 Section word counts:");
      const bp = session.blueprint;
      const sections = [
        bp.executiveSummary,
        bp.businessModelCanvas,
        bp.targetMarket,
        bp.competitorAnalysis,
        bp.revenueModel,
        bp.estimatedBudget,
        bp.goToMarketStrategy,
        bp.fundingOpportunities,
        bp.governmentSchemes,
        bp.legalConsiderations,
        bp.riskAssessment,
        bp.implementationRoadmap,
      ];
      sections.forEach((s) => {
        console.log(`   ${s.title.padEnd(45)} ${s.wordCount} words`);
      });
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
