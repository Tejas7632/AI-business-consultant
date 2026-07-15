/**
 * IBM watsonx.ai Client — Granite LLM Integration
 * Wraps IBM watsonx REST API for text generation and embeddings via IBM Granite models
 */
export interface GenerationRequest {
    prompt: string;
    modelId?: string;
    maxNewTokens?: number;
    temperature?: number;
    stopSequences?: string[];
}
export interface GenerationResponse {
    generatedText: string;
    inputTokenCount: number;
    generatedTokenCount: number;
    stopReason: string;
    modelId: string;
}
export interface EmbeddingRequest {
    texts: string[];
    modelId?: string;
}
export interface EmbeddingResponse {
    embeddings: number[][];
    modelId: string;
    inputTokenCount: number;
}
export declare class WatsonxClient {
    private readonly tokenManager;
    private readonly httpClient;
    constructor();
    /**
     * Generate text using IBM Granite model via watsonx.ai
     */
    generate(request: GenerationRequest): Promise<GenerationResponse>;
    /**
     * Generate embeddings using IBM Granite embedding model
     */
    embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
    /**
     * Test connectivity to IBM watsonx.ai
     */
    healthCheck(): Promise<{
        status: "ok" | "error";
        message: string;
    }>;
}
export declare const watsonxClient: WatsonxClient;
//# sourceMappingURL=watsonx-client.d.ts.map