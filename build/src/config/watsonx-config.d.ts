/**
 * IBM watsonx Orchestrate & IBM Cloud Configuration
 * Loads and validates all environment variables for IBM services
 */
export declare const config: {
    WATSONX_API_KEY: string;
    WATSONX_URL: string;
    WATSONX_PROJECT_ID: string;
    GRANITE_MODEL_ID: string;
    GRANITE_INSTRUCT_MODEL_ID: string;
    GRANITE_EMBEDDING_MODEL_ID: string;
    WATSON_DISCOVERY_VERSION: string;
    WATSON_ASSISTANT_VERSION: string;
    AGENT_TEMPERATURE: number;
    AGENT_MAX_TOKENS: number;
    RAG_TOP_K: number;
    RAG_MIN_SCORE: number;
    OUTPUT_DIR: string;
    OUTPUT_FORMAT: "markdown" | "json" | "both";
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    LOG_FILE: string;
    WATSON_DISCOVERY_API_KEY?: string | undefined;
    WATSON_DISCOVERY_URL?: string | undefined;
    WATSON_DISCOVERY_PROJECT_ID?: string | undefined;
    WATSON_ASSISTANT_API_KEY?: string | undefined;
    WATSON_ASSISTANT_URL?: string | undefined;
    WATSON_ASSISTANT_ID?: string | undefined;
};
export declare const WATSONX_GENERATION_PARAMS: {
    model_id: string;
    project_id: string;
    parameters: {
        decoding_method: "greedy";
        max_new_tokens: number;
        min_new_tokens: number;
        temperature: number;
        top_k: number;
        top_p: number;
        repetition_penalty: number;
        stop_sequences: string[];
    };
};
export declare const WATSONX_EMBEDDING_PARAMS: {
    model_id: string;
    project_id: string;
};
export declare const IBM_ENDPOINTS: {
    readonly watsonxai: `${string}/ml/v1`;
    readonly tokenEndpoint: "https://iam.cloud.ibm.com/identity/token";
    readonly discovery: string | undefined;
    readonly assistant: string | undefined;
};
export declare const FEATURES: {
    readonly useWatsonDiscovery: boolean;
    readonly useWatsonAssistant: boolean;
    readonly useEmbeddingModel: true;
    readonly enableStreaming: false;
    readonly enableCaching: true;
};
//# sourceMappingURL=watsonx-config.d.ts.map