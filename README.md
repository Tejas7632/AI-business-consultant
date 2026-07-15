# 🚀 IBM watsonx Startup Blueprint Generator Agent

> **AI-powered startup consulting at scale** — Transform any startup idea into a complete, actionable business blueprint using IBM watsonx Orchestrate, IBM Granite models, and Retrieval-Augmented Generation (RAG).

---

## Overview

The **Startup Blueprint Generator Agent** is an industry-grade AI agent built on the IBM watsonx platform. Given a startup idea, it retrieves relevant business intelligence from a structured knowledge base and uses IBM Granite language models to generate a comprehensive **12-section Startup Blueprint** in under 3 minutes.

```
User Idea → RAG Retrieval (IBM Watson Discovery / In-Memory) → IBM Granite Generation → Structured Blueprint
```

### What It Generates

| # | Section | Description |
|---|---------|-------------|
| 1 | **Executive Summary** | Investor-ready 200-word overview |
| 2 | **Business Model Canvas** | All 9 BMC building blocks in table format |
| 3 | **Target Market Analysis** | TAM/SAM/SOM, customer personas, growth trends |
| 4 | **Competitor Analysis** | Direct/indirect competitors, moat, ERRC grid |
| 5 | **Revenue Model** | Pricing strategy, unit economics, MRR projections |
| 6 | **Estimated Budget** | Pre-launch costs, monthly OpEx, runway needed |
| 7 | **Go-to-Market Strategy** | Phased GTM, channels, first 100 customers plan |
| 8 | **Funding Opportunities** | VCs, angels, accelerators, crowdfunding |
| 9 | **Government Schemes** | DPIIT, Startup India, SBIR, EU Horizon, MUDRA |
| 10 | **Legal Considerations** | Entity structure, IP, data privacy (GDPR/CCPA) |
| 11 | **Risk Assessment** | Risk matrix with probability × impact scoring |
| 12 | **Implementation Roadmap** | 18-month phased Gantt-style roadmap |

---

## Architecture

```
startup-blueprint-agent/
├── src/
│   ├── index.ts                      ← Entry point + programmatic API exports
│   ├── cli.ts                        ← Commander.js CLI (generate / quick / health)
│   │
│   ├── config/
│   │   ├── agent-instructions.ts     ← ⭐ AGENT_INSTRUCTIONS — customize everything here
│   │   └── watsonx-config.ts         ← IBM Cloud env config + Zod validation
│   │
│   ├── agents/
│   │   └── orchestrator-agent.ts     ← IBM watsonx Orchestrate agent pipeline
│   │
│   ├── rag/
│   │   └── rag-engine.ts             ← RAG: Watson Discovery (prod) + In-Memory (dev)
│   │
│   ├── blueprint/
│   │   ├── blueprint-types.ts        ← TypeScript interfaces for all data structures
│   │   ├── blueprint-generator.ts    ← Section-by-section Granite generation engine
│   │   └── blueprint-formatter.ts    ← Saves blueprints as Markdown + JSON
│   │
│   ├── tools/
│   │   └── watsonx-client.ts         ← IBM watsonx.ai REST API client (IAM + generation)
│   │
│   └── utils/
│       └── logger.ts                 ← Winston structured logger
│
├── knowledge-base/
│   └── knowledge-docs.ts             ← 13 RAG knowledge documents across 9 domains
│
├── examples/
│   └── generate-blueprint.ts         ← Programmatic API usage examples
│
├── tests/
│   ├── knowledge-base.test.ts        ← Knowledge base unit tests
│   └── agent-instructions.test.ts    ← Agent config unit tests
│
├── .env.example                      ← Environment variable template
├── package.json
├── tsconfig.json
└── README.md
```

---

## IBM Services Used

| Service | Tier | Purpose |
|---------|------|---------|
| **IBM watsonx.ai** | Lite (free tier) | Granite LLM API for text generation |
| **IBM Granite 13B Instruct v2** | Included in Lite | Primary blueprint generation model |
| **IBM Granite 3-8B Instruct** | Included in Lite | Fast classification/instruct tasks |
| **IBM Granite Embedding 125M** | Included in Lite | Semantic embeddings for RAG |
| **IBM Watson Discovery** | Lite (free tier) | Production RAG knowledge retrieval |
| **IBM Watson Assistant** | Lite (optional) | Conversational chat interface |
| **IBM Cloud IAM** | Free | API key authentication |

> **IBM Cloud Lite accounts** get free access to all the above services. No credit card required for initial setup.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **IBM Cloud account** — [Sign up free](https://cloud.ibm.com/registration)
- **IBM watsonx.ai project** — [Create at watsonx.ai](https://dataplatform.cloud.ibm.com)

---

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd startup-blueprint-agent
npm install
```

### 2. Configure IBM Cloud Credentials

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Required — get from https://cloud.ibm.com/iam/apikeys
WATSONX_API_KEY=your_ibm_cloud_api_key

# Required — get from your watsonx.ai project settings
WATSONX_PROJECT_ID=your_project_id

# Required — your regional endpoint
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

#### How to get your watsonx.ai credentials:
1. Go to [cloud.ibm.com](https://cloud.ibm.com) → **Manage → Access (IAM) → API keys**
2. Create a new API key and copy it to `WATSONX_API_KEY`
3. Go to [dataplatform.cloud.ibm.com](https://dataplatform.cloud.ibm.com) → Create/open a project
4. Copy the **Project ID** from project settings to `WATSONX_PROJECT_ID`

### 3. Build

```bash
npm run build
```

### 4. Verify Connection

```bash
npm run start health
# OR
node build/index.js health
```

Expected output:
```
✅ Connected to IBM watsonx.ai — 47 models available
```

---

## Usage

### Interactive CLI

```bash
node build/index.js generate
# OR during development:
npx tsx src/index.ts generate
```

You'll be guided through a series of prompts:
```
📋 Tell us about your startup idea:

✔ Describe your startup idea: AI-powered inventory management for D2C brands
✔ Select your primary industry: E-Commerce
✔ Primary target market: India
✔ Current stage: Building MVP
✔ Funding status: Looking for pre-seed ($50K-$500K)
✔ What specific problem are you solving? (optional): ...
```

### Quick Mode (Non-Interactive)

```bash
node build/index.js quick \
  --idea "AI-powered inventory management for D2C brands in India" \
  --industry "E-Commerce" \
  --geo "India" \
  --stage "mvp" \
  --funding "pre-seed"
```

### Programmatic API

```typescript
import { StartupBlueprintAgent } from './src/agents/orchestrator-agent.js';
import type { StartupInput } from './src/blueprint/blueprint-types.js';

const agent = new StartupBlueprintAgent();

// Optional: track progress
agent.onProgress((progress) => {
  console.log(`[${progress.percentComplete}%] ${progress.currentSection}`);
});

const session = await agent.run({
  idea: "AI-powered personal finance app for millennials",
  industry: "FinTech",
  targetGeography: "India",
  stage: "mvp",
  fundingStage: "pre-seed",
  problemStatement: "Fragmented financial data across UPI, banks, and investments",
  founderBackground: "Ex-Goldman Sachs analyst + IIT graduate",
});

console.log(session.savedPaths?.markdown); // Path to saved Markdown report
console.log(session.blueprint?.executiveSummary.content); // Access any section
```

---

## Customizing Agent Behavior — `AGENT_INSTRUCTIONS`

The [`src/config/agent-instructions.ts`](src/config/agent-instructions.ts) file is the **single source of truth** for agent behavior. Every aspect of the agent is configurable:

### Change Tone & Persona
```typescript
TONE: {
  style: "formal",           // "formal" | "professional-yet-approachable" | "casual"
  voice: "advisory",         // "authoritative" | "advisory" | "collaborative"
  language: "technical",     // "clear-and-jargon-free" | "technical"
}
```

### Disable / Enable Sections
```typescript
SCOPE: {
  sections: {
    governmentSchemes: { enabled: false },  // Skip this section
    riskAssessment:    { enabled: true,  priority: "critical" },
  }
}
```

### Change Output Depth
```typescript
SCOPE: {
  depth: "summary",          // "summary" | "standard" | "comprehensive"
  includeExamples: false,    // Disable real-world examples
  includeMetrics: true,      // Keep KPIs and metrics
}
```

### Custom System Prompt
```typescript
SYSTEM_PROMPT: `You are a lean startup consultant focused on rapid validation...`
```

### Modify Section Prompts
```typescript
SECTION_PROMPTS: {
  executiveSummary: `Write a 1-paragraph Lean Canvas-style summary...`,
  revenueModel: `Focus exclusively on subscription models with annual pricing...`,
}
```

---

## RAG Knowledge Base

The knowledge base in [`knowledge-base/knowledge-docs.ts`](knowledge-base/knowledge-docs.ts) contains **structured domain knowledge** across 9 areas:

| Domain | Documents | Key Topics |
|--------|-----------|------------|
| `market-research` | 2 | TAM/SAM/SOM, customer personas, research sources |
| `funding-options` | 2 | Funding stages, pitch deck, valuation benchmarks |
| `government-schemes` | 2 | India (DPIIT/SIDBI/AIM), USA (SBIR/SBA), EU (EIC) |
| `legal-requirements` | 2 | Incorporation, IP, GDPR, CCPA, DPDP Act |
| `revenue-models` | 1 | SaaS, marketplace, freemium, unit economics |
| `competitor-analysis` | 1 | Porter's Five Forces, ERRC, competitive moat |
| `risk-management` | 1 | Risk matrix, mitigation strategies |
| `startup-incubators` | 1 | YC, Techstars, IBM programs, India accelerators |
| `go-to-market` | 1 | PLG, SLG, CAC benchmarks, channel strategies |

### Extending the Knowledge Base

Add new documents to the domain arrays in `knowledge-docs.ts`:

```typescript
export const MARKET_RESEARCH_DOCS: KnowledgeDocument[] = [
  // ... existing docs
  {
    id: "mr-003",
    domain: "market-research",
    title: "My Custom Research Framework",
    tags: ["custom", "research"],
    content: `Your domain knowledge here...`,
    source: "Internal Research",
    lastUpdated: "2024-04-15",
  },
];
```

### Production: Replace with Watson Discovery

In production, replace the in-memory store with IBM Watson Discovery:

```bash
# Add to .env
WATSON_DISCOVERY_API_KEY=your_key
WATSON_DISCOVERY_URL=https://api.us-south.discovery.watson.cloud.ibm.com/instances/your_id
WATSON_DISCOVERY_PROJECT_ID=your_project_id
```

The agent automatically switches to Watson Discovery when these variables are set.

---

## IBM Granite Model Selection

| Use Case | Recommended Model | Config Key |
|----------|------------------|------------|
| Blueprint generation | `ibm/granite-13b-instruct-v2` | `GRANITE_MODEL_ID` |
| Fast classification | `ibm/granite-3-8b-instruct` | `GRANITE_INSTRUCT_MODEL_ID` |
| Semantic search | `ibm/granite-embedding-125m-english` | `GRANITE_EMBEDDING_MODEL_ID` |
| Larger context | `ibm/granite-20b-multilingual` | Manual override |

Change the model in `.env`:
```bash
GRANITE_MODEL_ID=ibm/granite-20b-multilingual
```

---

## Output Files

Generated blueprints are saved to `./output/` (configurable via `OUTPUT_DIR`):

```
output/
├── blueprint-ai-powered-fintech-app-2024-04-15T10-30-00.md   ← Full Markdown report
└── blueprint-ai-powered-fintech-app-2024-04-15T10-30-00.json ← Structured JSON data
```

Change format in `.env`:
```bash
OUTPUT_FORMAT=markdown   # Only Markdown
OUTPUT_FORMAT=json       # Only JSON
OUTPUT_FORMAT=both       # Both (default)
```

---

## Deployment Options

### Local Development
```bash
npm run dev     # tsx watch mode
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY build/ ./build/
COPY knowledge-base/ ./knowledge-base/
CMD ["node", "build/index.js", "generate"]
```

### IBM Code Engine (Serverless)
```bash
ibmcloud ce app create \
  --name startup-blueprint-agent \
  --image us.icr.io/your-ns/startup-blueprint-agent:latest \
  --env WATSONX_API_KEY=$WATSONX_API_KEY \
  --env WATSONX_PROJECT_ID=$WATSONX_PROJECT_ID \
  --env WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### IBM watsonx Orchestrate Integration
Register as a tool in IBM watsonx Orchestrate by exposing an HTTP endpoint that accepts `StartupInput` and returns `StartupBlueprint`.

---

## Running Tests

```bash
npm test
```

---

## IBM watsonx Orchestrate Best Practices Applied

✅ **Separation of concerns** — Config, agent logic, RAG, and generation are fully decoupled  
✅ **Editable AGENT_INSTRUCTIONS** — Single file controls all agent behavior  
✅ **Hybrid RAG** — Watson Discovery for production, in-memory fallback for development  
✅ **IAM token management** — Automatic token refresh with 60-second buffer  
✅ **Error resilience** — RAG failures gracefully fall back to model knowledge  
✅ **Modular section generation** — Each section independently regeneratable  
✅ **Structured outputs** — Both human-readable Markdown and machine-readable JSON  
✅ **IBM Lite tier compatible** — No paid services required for development  
✅ **Type safety** — Full TypeScript with Zod runtime validation  
✅ **Observability** — Winston structured logging with configurable levels  

---

## License

MIT — See [LICENSE](LICENSE)

---

*Built with ❤️ using IBM watsonx Orchestrate, IBM Granite, IBM Watson Discovery, and IBM Cloud Lite services.*
