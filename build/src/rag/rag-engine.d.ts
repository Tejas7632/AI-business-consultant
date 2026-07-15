/**
 * RAG Engine — Retrieval-Augmented Generation using IBM watsonx Embeddings
 * Supports both Watson Discovery (production) and in-memory vector search (development)
 */
export interface RetrievedChunk {
    id: string;
    domain: string;
    title: string;
    content: string;
    score: number;
    source?: string;
}
export interface RAGContext {
    chunks: RetrievedChunk[];
    query: string;
    domain: string;
    totalRetrieved: number;
    contextText: string;
}
export declare class RAGEngine {
    private memoryStore;
    private discoveryClient;
    constructor();
    initialize(): Promise<void>;
    /**
     * Retrieve relevant context for a given query and domain
     */
    retrieve(query: string, domain?: string): Promise<RAGContext>;
    /**
     * Retrieve context for multiple domains in parallel
     */
    retrieveMultiDomain(query: string, domains: string[]): Promise<Map<string, RAGContext>>;
}
//# sourceMappingURL=rag-engine.d.ts.map