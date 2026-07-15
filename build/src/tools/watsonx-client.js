/**
 * IBM watsonx.ai Client — Granite LLM Integration
 * Wraps IBM watsonx REST API for text generation and embeddings via IBM Granite models
 */
import axios from "axios";
import { config, WATSONX_GENERATION_PARAMS, WATSONX_EMBEDDING_PARAMS, IBM_ENDPOINTS } from "../config/watsonx-config.js";
import { logger } from "../utils/logger.js";
// ── IAM Token Manager ─────────────────────────────────────────────────────────
class IAMTokenManager {
    accessToken = null;
    tokenExpiry = 0;
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async getToken() {
        // Return cached token if still valid (with 60-second buffer)
        if (this.accessToken && Date.now() < this.tokenExpiry - 60_000) {
            return this.accessToken;
        }
        logger.debug("Refreshing IBM IAM access token...");
        try {
            const response = await axios.post(IBM_ENDPOINTS.tokenEndpoint, new URLSearchParams({
                grant_type: "urn:ibm:params:oauth:grant-type:apikey",
                apikey: this.apiKey,
            }), {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                timeout: 10_000,
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
            logger.debug("IBM IAM token refreshed successfully.");
            return this.accessToken;
        }
        catch (error) {
            const msg = axios.isAxiosError(error)
                ? `IAM token request failed: ${error.response?.status} ${error.response?.statusText}`
                : `IAM token request failed: ${String(error)}`;
            logger.error(msg);
            throw new Error(msg);
        }
    }
}
// ── watsonx.ai Client ─────────────────────────────────────────────────────────
export class WatsonxClient {
    tokenManager;
    httpClient;
    constructor() {
        this.tokenManager = new IAMTokenManager(config.WATSONX_API_KEY);
        this.httpClient = axios.create({
            baseURL: IBM_ENDPOINTS.watsonxai,
            timeout: 120_000, // 2-minute timeout for large blueprint generation
            headers: { "Content-Type": "application/json" },
        });
        // Attach auth header to every request
        this.httpClient.interceptors.request.use(async (reqConfig) => {
            const token = await this.tokenManager.getToken();
            reqConfig.headers["Authorization"] = `Bearer ${token}`;
            return reqConfig;
        });
    }
    /**
     * Generate text using IBM Granite model via watsonx.ai
     */
    async generate(request) {
        const params = WATSONX_GENERATION_PARAMS;
        const payload = {
            model_id: request.modelId ?? params.model_id,
            project_id: params.project_id,
            input: request.prompt,
            parameters: {
                ...params.parameters,
                max_new_tokens: request.maxNewTokens ?? params.parameters.max_new_tokens,
                temperature: request.temperature ?? params.parameters.temperature,
                ...(request.stopSequences && { stop_sequences: request.stopSequences }),
            },
        };
        logger.debug(`Sending generation request to Granite model: ${payload.model_id}`);
        logger.debug(`Prompt length: ${request.prompt.length} characters`);
        try {
            const response = await this.httpClient.post("/text/generation?version=2023-05-29", payload);
            const result = response.data.results?.[0];
            if (!result) {
                throw new Error("No generation result returned from watsonx.ai");
            }
            return {
                generatedText: result.generated_text,
                inputTokenCount: result.input_token_count ?? 0,
                generatedTokenCount: result.generated_token_count ?? 0,
                stopReason: result.stop_reason ?? "unknown",
                modelId: response.data.model_id ?? payload.model_id,
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const detail = JSON.stringify(error.response?.data);
                logger.error(`watsonx.ai generation error: HTTP ${status} — ${detail}`);
                throw new Error(`watsonx.ai API error (${status}): ${detail}`);
            }
            throw error;
        }
    }
    /**
     * Generate embeddings using IBM Granite embedding model
     */
    async embed(request) {
        const params = WATSONX_EMBEDDING_PARAMS;
        const payload = {
            model_id: request.modelId ?? params.model_id,
            project_id: params.project_id,
            inputs: request.texts,
        };
        try {
            const response = await this.httpClient.post("/text/embeddings?version=2023-10-25", payload);
            const results = response.data.results;
            return {
                embeddings: results.map((r) => r.embedding),
                modelId: response.data.model_id,
                inputTokenCount: response.data.input_token_count ?? 0,
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                logger.error(`Embedding error: HTTP ${error.response?.status}`);
                throw new Error(`Embedding API error: ${String(error.response?.data)}`);
            }
            throw error;
        }
    }
    /**
     * Test connectivity to IBM watsonx.ai
     */
    async healthCheck() {
        try {
            await this.tokenManager.getToken();
            const response = await this.httpClient.get(`/foundation_model_specs?version=2023-05-29&project_id=${config.WATSONX_PROJECT_ID}&limit=1`);
            const modelCount = response.data.total_count;
            return {
                status: "ok",
                message: `Connected to IBM watsonx.ai — ${modelCount} models available`,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: `Cannot reach IBM watsonx.ai: ${String(error)}`,
            };
        }
    }
}
// ── Singleton Instance ─────────────────────────────────────────────────────────
export const watsonxClient = new WatsonxClient();
//# sourceMappingURL=watsonx-client.js.map