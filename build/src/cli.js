/**
 * CLI Interface — Interactive command-line tool for the Startup Blueprint Generator
 * Built with Commander.js and Inquirer.js
 */
import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import { StartupBlueprintAgent } from "./agents/orchestrator-agent.js";
// ── CLI Colors & Formatting ───────────────────────────────────────────────────
const banner = chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════════════╗
║          🚀  IBM watsonx Startup Blueprint Generator Agent           ║
║     Powered by IBM Granite AI  |  RAG-Enhanced  |  Cloud Lite       ║
╚══════════════════════════════════════════════════════════════════════╝
`);
// ── Progress Spinner Handler ──────────────────────────────────────────────────
function createProgressHandler(spinner) {
    return (progress) => {
        if (progress.percentComplete === 100) {
            spinner.text = chalk.green("Assembling final blueprint...");
        }
        else {
            spinner.text =
                chalk.cyan(`[${progress.percentComplete}%] `) +
                    chalk.white(`Generating: `) +
                    chalk.yellow(progress.currentSection) +
                    chalk.gray(` (${progress.completedSections}/${progress.totalSections} sections)`) +
                    chalk.gray(` — ~${progress.estimatedRemainingSeconds}s remaining`);
        }
    };
}
// ── Interactive Input Prompt ───────────────────────────────────────────────────
async function promptForStartupInput() {
    console.log(chalk.bold.white("\n📋 Tell us about your startup idea:\n"));
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "idea",
            message: chalk.cyan("Describe your startup idea:"),
            validate: (val) => val.trim().length >= 10 || "Please provide at least 10 characters.",
        },
        {
            type: "list",
            name: "industry",
            message: chalk.cyan("Select your primary industry:"),
            choices: [
                "FinTech",
                "HealthTech",
                "EdTech",
                "AgriTech",
                "CleanTech / GreenTech",
                "E-Commerce",
                "SaaS / B2B Software",
                "AI / Machine Learning",
                "Web3 / Blockchain",
                "DeepTech / Hardware",
                "FoodTech",
                "PropTech",
                "LogTech / Supply Chain",
                "Media / Content",
                "Gaming",
                "Other",
            ],
        },
        {
            type: "list",
            name: "targetGeography",
            message: chalk.cyan("Primary target market:"),
            choices: ["India", "USA", "Europe (EU)", "Southeast Asia", "Global", "Africa", "UK", "Other"],
        },
        {
            type: "list",
            name: "stage",
            message: chalk.cyan("Current stage:"),
            choices: [
                { name: "💡 Idea stage (pre-product)", value: "idea" },
                { name: "🛠️  Building MVP", value: "mvp" },
                { name: "📈 Early revenue (<$10K MRR)", value: "early-revenue" },
                { name: "🚀 Growth stage ($10K+ MRR)", value: "growth" },
            ],
        },
        {
            type: "list",
            name: "fundingStage",
            message: chalk.cyan("Funding status:"),
            choices: [
                { name: "Self-funded (bootstrapped)", value: "bootstrapped" },
                { name: "Looking for pre-seed ($50K-$500K)", value: "pre-seed" },
                { name: "Looking for seed ($500K-$3M)", value: "seed" },
                { name: "Looking for Series A ($3M+)", value: "series-a" },
            ],
        },
        {
            type: "input",
            name: "problemStatement",
            message: chalk.cyan("What specific problem are you solving? (optional):"),
        },
        {
            type: "input",
            name: "founderBackground",
            message: chalk.cyan("Brief founder background (optional):"),
        },
        {
            type: "input",
            name: "existingTraction",
            message: chalk.cyan("Any existing traction? (users, revenue, pilots — optional):"),
        },
        {
            type: "input",
            name: "additionalContext",
            message: chalk.cyan("Anything else to consider? (optional):"),
        },
    ]);
    return answers;
}
// ── Main CLI Setup ─────────────────────────────────────────────────────────────
const program = new Command();
program
    .name("startup-blueprint")
    .description("AI-Powered Startup Blueprint Generator using IBM watsonx + IBM Granite")
    .version("1.0.0");
// ── Command: generate (interactive) ───────────────────────────────────────────
program
    .command("generate")
    .description("Interactively generate a startup blueprint")
    .action(async () => {
    console.log(banner);
    const agent = new StartupBlueprintAgent();
    // Collect startup input
    const input = await promptForStartupInput();
    console.log(chalk.bold.white(`\n⚡ Generating blueprint for: `) +
        chalk.yellow(`"${input.idea.substring(0, 60)}..."`) +
        chalk.gray(` [${input.industry} · ${input.targetGeography}]\n`));
    const spinner = ora({
        text: chalk.cyan("Connecting to IBM watsonx.ai..."),
        color: "cyan",
    }).start();
    agent.onProgress(createProgressHandler(spinner));
    try {
        const session = await agent.run(input);
        spinner.succeed(chalk.green("Blueprint generated successfully!"));
        if (session.savedPaths?.markdown) {
            console.log(chalk.bold(`\n📄 Markdown report: `) + chalk.blue(session.savedPaths.markdown));
        }
        if (session.savedPaths?.json) {
            console.log(chalk.bold(`📦 JSON data:       `) + chalk.blue(session.savedPaths.json));
        }
        console.log(chalk.bold.cyan("\n✅ Your startup blueprint is ready!\n"));
    }
    catch (err) {
        spinner.fail(chalk.red("Blueprint generation failed."));
        console.error(chalk.red(`\n❌ Error: ${err instanceof Error ? err.message : String(err)}\n`));
        process.exit(1);
    }
});
// ── Command: quick (non-interactive, from flags) ───────────────────────────────
program
    .command("quick")
    .description("Generate a blueprint directly from command-line flags")
    .requiredOption("-i, --idea <text>", "Startup idea description")
    .option("--industry <name>", "Industry (e.g., FinTech, HealthTech)", "Technology")
    .option("--geo <country>", "Target geography", "Global")
    .option("--stage <stage>", "Startup stage: idea|mvp|early-revenue|growth", "idea")
    .option("--funding <stage>", "Funding stage: bootstrapped|pre-seed|seed|series-a", "pre-seed")
    .action(async (opts) => {
    console.log(banner);
    const agent = new StartupBlueprintAgent();
    const input = {
        idea: opts.idea,
        industry: opts.industry,
        targetGeography: opts.geo,
        stage: opts.stage,
        fundingStage: opts.funding,
    };
    const spinner = ora({ text: chalk.cyan("Connecting to IBM watsonx.ai..."), color: "cyan" }).start();
    agent.onProgress(createProgressHandler(spinner));
    try {
        const session = await agent.run(input);
        spinner.succeed(chalk.green("Blueprint generated!"));
        if (session.savedPaths?.markdown) {
            console.log(`\n📄 ${session.savedPaths.markdown}`);
        }
    }
    catch (err) {
        spinner.fail(chalk.red("Failed."));
        console.error(chalk.red(err instanceof Error ? err.message : String(err)));
        process.exit(1);
    }
});
// ── Command: health ────────────────────────────────────────────────────────────
program
    .command("health")
    .description("Check IBM watsonx.ai connectivity and agent readiness")
    .action(async () => {
    console.log(banner);
    const { watsonxClient } = await import("./tools/watsonx-client.js");
    const spinner = ora("Checking IBM watsonx.ai connection...").start();
    try {
        const result = await watsonxClient.healthCheck();
        if (result.status === "ok") {
            spinner.succeed(chalk.green(`✅ ${result.message}`));
        }
        else {
            spinner.fail(chalk.red(`❌ ${result.message}`));
            process.exit(1);
        }
    }
    catch (err) {
        spinner.fail(chalk.red("Connection check failed."));
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
    }
});
export default program;
//# sourceMappingURL=cli.js.map