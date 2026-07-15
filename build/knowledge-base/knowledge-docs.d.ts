/**
 * RAG Knowledge Base — Domain-specific knowledge documents
 * These structured documents are chunked and embedded for semantic retrieval.
 * In production, these are replaced by Watson Discovery collections.
 */
export interface KnowledgeDocument {
    id: string;
    domain: string;
    title: string;
    content: string;
    tags: string[];
    source?: string;
    lastUpdated?: string;
}
export declare const MARKET_RESEARCH_DOCS: KnowledgeDocument[];
export declare const FUNDING_DOCS: KnowledgeDocument[];
export declare const GOVERNMENT_SCHEMES_DOCS: KnowledgeDocument[];
export declare const LEGAL_DOCS: KnowledgeDocument[];
export declare const REVENUE_MODEL_DOCS: KnowledgeDocument[];
export declare const COMPETITOR_DOCS: KnowledgeDocument[];
export declare const RISK_DOCS: KnowledgeDocument[];
export declare const INCUBATOR_DOCS: KnowledgeDocument[];
export declare const GTM_DOCS: KnowledgeDocument[];
export declare const ALL_KNOWLEDGE_DOCS: KnowledgeDocument[];
export declare const KNOWLEDGE_BASE_META: {
    version: string;
    totalDocuments: number;
    domains: string[];
    lastUpdated: string;
};
//# sourceMappingURL=knowledge-docs.d.ts.map