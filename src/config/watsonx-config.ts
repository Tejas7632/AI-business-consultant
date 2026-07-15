/**
 * IBM watsonx Orchestrate & IBM Cloud Configuration
 * Loads and validates all environment variables for IBM services
 */

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// ── Environment Schema Validation ─────────────────────────────────────────────
const EnvSchema = z.object({
  // watsonx.ai
  WATSONX_API_KEY: z.string().min(1, "WATSONX_API_KEY is required"),
  WATSONX_URL: z.string().url("WATSONX_URL must be a valid URL"),
  WATSONX_PROJECT_ID: z.string().min(1, "WATSONX_PROJECT_ID is required"),

  // Models available in your watsonx.ai project
  GRANITE_MODEL_ID: z.string().default("meta-llama/llama-3-1-8b"),
  GRANITE_INSTRUCT_MODEL_ID: z.string().default("meta-llama/llama-3-1-8b"),
  GRANITE_EMBEDDING_MODEL_ID: z.string().default("ibm/slate-125m-english-rtrvr-v2"),

  // Watson Discovery (optional — falls back to in-memory RAG)
  WATSON_DISCOVERY_API_KEY: z.string().optional(),
  WATSON_DISCOVERY_URL: z.string().url().optional(),
  WATSON_DISCOVERY_PROJECT_ID: z.string().optional(),
  WATSON_DISCOVERY_VERSION: z.string().default("2023-03-31"),

  // Watson Assistant (optional)
  WATSON_ASSISTANT_API_KEY: z.string().optional(),
  WATSON_ASSISTANT_URL: z.string().url().optional(),
  WATSON_ASSISTANT_ID: z.string().optional(),
  WATSON_ASSISTANT_VERSION: z.string().default("2023-06-15"),

  // Agent settings
  AGENT_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.7),
  AGENT_MAX_TOKENS: z.coerce.number().min(512).max(8192).default(4096),

  // RAG settings
  RAG_TOP_K: z.coerce.number().min(1).max(20).default(5),
  RAG_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.65),

  // Output
  OUTPUT_DIR: z.string().default("./output"),
  OUTPUT_FORMAT: z.enum(["markdown", "json", "both"]).default("both"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().default("./logs/agent.log"),
});

type Env = z.infer<typeof EnvSchema>;

// ── Config Loader ──────────────────────────────────────────────────────────────
function loadConfig(): Env {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Configuration Error — Missing or invalid environment variables:\n${messages}\n\nCopy .env.example to .env and fill in your IBM Cloud credentials.`
    );
  }

  return result.data;
}

export const config = loadConfig();

// ── watsonx.ai Model Parameters ───────────────────────────────────────────────
export const WATSONX_GENERATION_PARAMS = {
  model_id: config.GRANITE_MODEL_ID,
  project_id: config.WATSONX_PROJECT_ID,
  parameters: {
    decoding_method: "greedy" as const,
    max_new_tokens: config.AGENT_MAX_TOKENS,
    min_new_tokens: 50,
    temperature: config.AGENT_TEMPERATURE,
    top_k: 50,
    top_p: 0.95,
    repetition_penalty: 1.1,
    stop_sequences: ["<|endoftext|>", "Human:", "User:"],
  },
};

export const WATSONX_EMBEDDING_PARAMS = {
  model_id: config.GRANITE_EMBEDDING_MODEL_ID,
  project_id: config.WATSONX_PROJECT_ID,
};

// ── IBM Service Endpoints ─────────────────────────────────────────────────────
export const IBM_ENDPOINTS = {
  watsonxai: `${config.WATSONX_URL}/ml/v1`,
  tokenEndpoint: "https://iam.cloud.ibm.com/identity/token",
  discovery: config.WATSON_DISCOVERY_URL,
  assistant: config.WATSON_ASSISTANT_URL,
} as const;

// ── Feature Flags ─────────────────────────────────────────────────────────────
export const FEATURES = {
  useWatsonDiscovery: !!(
    config.WATSON_DISCOVERY_API_KEY &&
    config.WATSON_DISCOVERY_URL
  ),
  useWatsonAssistant: !!(
    config.WATSON_ASSISTANT_API_KEY &&
    config.WATSON_ASSISTANT_URL
  ),
  useEmbeddingModel: true,
  enableStreaming: false,
  enableCaching: true,
} as const;