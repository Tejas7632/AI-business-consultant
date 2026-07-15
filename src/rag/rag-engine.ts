/**
 * RAG Engine — Retrieval-Augmented Generation using IBM watsonx Embeddings
 * Supports both Watson Discovery (production) and in-memory vector search (development)
 */

import { config, FEATURES, IBM_ENDPOINTS } from "../config/watsonx-config.js";
import { ALL_KNOWLEDGE_DOCS, type KnowledgeDocument } from "../../knowledge-base/knowledge-docs.js";
import { logger } from "../utils/logger.js";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────
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

interface EmbeddingVector {
  docId: string;
  vector: number[];
  document: KnowledgeDocument;
}

// ── In-Memory Vector Store (Development / IBM Cloud Lite fallback) ──────────
class InMemoryVectorStore {
  private vectors: EmbeddingVector[] = [];
  private initialized = false;

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Simple TF-IDF-like term frequency scoring (used when embedding API unavailable)
   */
  private termFrequencyScore(query: string, document: KnowledgeDocument): number {
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const docText = `${document.title} ${document.content} ${document.tags.join(" ")}`.toLowerCase();

    let score = 0;
    for (const term of queryTerms) {
      const occurrences = (docText.match(new RegExp(term, "g")) || []).length;
      score += occurrences * (1 + (document.title.toLowerCase().includes(term) ? 2 : 0));
    }

    // Boost documents by domain match
    const domainKeywords: Record<string, string[]> = {
      "market-research":    ["market", "customer", "persona", "tam", "sam", "som", "research"],
      "funding-options":    ["funding", "investor", "vc", "angel", "seed", "capital", "raise"],
      "government-schemes": ["government", "grant", "scheme", "dpiit", "startup india", "sbir"],
      "legal-requirements": ["legal", "incorporation", "patent", "trademark", "compliance", "gdpr"],
      "revenue-models":     ["revenue", "pricing", "subscription", "saas", "monetize", "model"],
      "competitor-analysis":["competitor", "competition", "market", "alternative", "moat"],
      "risk-management":    ["risk", "mitigation", "failure", "threat", "challenge"],
      "startup-incubators": ["accelerator", "incubator", "yc", "techstars", "program"],
      "go-to-market":       ["marketing", "launch", "acquisition", "channel", "growth", "gtm"],
    };

    const domainTerms = domainKeywords[document.domain] || [];
    const queryHasDomainTerms = queryTerms.some((qt) => domainTerms.some((dt) => dt.includes(qt) || qt.includes(dt)));
    if (queryHasDomainTerms) score *= 1.5;

    // Normalize by document length
    const docLength = docText.split(/\s+/).length;
    return score / Math.sqrt(docLength);
  }

  /**
   * Initialize the store by loading all knowledge documents
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    logger.info(`Initializing in-memory RAG store with ${ALL_KNOWLEDGE_DOCS.length} documents...`);
    // In production, we'd generate real embeddings via watsonx API here
    // For lite/dev mode, we store placeholder vectors and use TF-IDF scoring
    this.vectors = ALL_KNOWLEDGE_DOCS.map((doc) => ({
      docId: doc.id,
      vector: [],  // Placeholder — real embeddings generated via API in production
      document: doc,
    }));
    this.initialized = true;
    logger.info("In-memory RAG store initialized.");
  }

  /**
   * Search documents using term frequency scoring (TF-IDF approximation)
   */
  search(query: string, topK: number, domain?: string): RetrievedChunk[] {
    let candidates = this.vectors;

    // Filter by domain if specified
    if (domain) {
      candidates = candidates.filter((v) => v.document.domain === domain);
      // If no domain matches, search all
      if (candidates.length === 0) candidates = this.vectors;
    }

    const scored = candidates.map((v) => ({
      chunk: {
        id: v.document.id,
        domain: v.document.domain,
        title: v.document.title,
        content: v.document.content,
        score: this.termFrequencyScore(query, v.document),
        source: v.document.source,
      } as RetrievedChunk,
    }));

    return scored
      .sort((a, b) => b.chunk.score - a.chunk.score)
      .slice(0, topK)
      .map((s) => s.chunk)
      .filter((c) => c.score > 0);
  }
}

// ── Watson Discovery Client (Production) ─────────────────────────────────────
class WatsonDiscoveryClient {
  private apiKey: string;
  private serviceUrl: string;
  private projectId: string;
  private version: string;
  private bearerToken: string | null = null;

  constructor() {
    this.apiKey = config.WATSON_DISCOVERY_API_KEY!;
    this.serviceUrl = config.WATSON_DISCOVERY_URL!;
    this.projectId = config.WATSON_DISCOVERY_PROJECT_ID!;
    this.version = config.WATSON_DISCOVERY_VERSION;
  }

  private async getBearerToken(): Promise<string> {
    if (this.bearerToken) return this.bearerToken;

    const response = await axios.post(IBM_ENDPOINTS.tokenEndpoint, null, {
      params: {
        grant_type: "urn:ibm:params:oauth:grant-type:apikey",
        apikey: this.apiKey,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.bearerToken = response.data.access_token as string;
    // Token expires in 1 hour — clear cache after 55 minutes
    setTimeout(() => { this.bearerToken = null; }, 55 * 60 * 1000);
    return this.bearerToken;
  }

  async query(naturalLanguageQuery: string, topK: number): Promise<RetrievedChunk[]> {
    const token = await this.getBearerToken();

    const response = await axios.post(
      `${this.serviceUrl}/v2/projects/${this.projectId}/query`,
      {
        natural_language_query: naturalLanguageQuery,
        count: topK,
        passages: {
          enabled: true,
          count: topK,
          characters: 1500,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { version: this.version },
      }
    );

    const results = response.data.results || [];
    return results.map((result: Record<string, unknown>, idx: number) => ({
      id: result.document_id as string || `disc-${idx}`,
      domain: (result.metadata as Record<string, string>)?.domain || "general",
      title: result.title as string || "Document",
      content: result.text as string || "",
      score: result.result_metadata
        ? (result.result_metadata as Record<string, number>).confidence
        : 0.5,
      source: "Watson Discovery",
    }));
  }
}

// ── RAG Engine ────────────────────────────────────────────────────────────────
export class RAGEngine {
  private memoryStore: InMemoryVectorStore;
  private discoveryClient: WatsonDiscoveryClient | null;

 constructor() {
  this.memoryStore = new InMemoryVectorStore();

  const discoveryEnabled =
    FEATURES.useWatsonDiscovery &&
    !!config.WATSON_DISCOVERY_API_KEY &&
    !!config.WATSON_DISCOVERY_PROJECT_ID &&
    !!config.WATSON_DISCOVERY_URL &&
    !config.WATSON_DISCOVERY_API_KEY.includes("your_") &&
    !config.WATSON_DISCOVERY_PROJECT_ID.includes("your_") &&
    !config.WATSON_DISCOVERY_URL.includes("your_instance");

  this.discoveryClient = discoveryEnabled
    ? new WatsonDiscoveryClient()
    : null;
}

  async initialize(): Promise<void> {
    await this.memoryStore.initialize();
    if (this.discoveryClient) {
      logger.info("RAG Mode : Watson Discovery");
    } else {
      logger.info("RAG Mode : In-Memory Knowledge Base");
    }
  }

  /**
   * Retrieve relevant context for a given query and domain
   */
  async retrieve(query: string, domain?: string): Promise<RAGContext> {
    const topK = config.RAG_TOP_K;
    let chunks: RetrievedChunk[] = [];

    try {
      if (this.discoveryClient) {
        // Production: Use Watson Discovery
        chunks = await this.discoveryClient.query(query, topK);
        logger.debug(`Watson Discovery returned ${chunks.length} results for query: "${query}"`);
      } else {
        // Development: Use in-memory TF-IDF store
        chunks = this.memoryStore.search(query, topK, domain);
        logger.debug(`In-memory RAG returned ${chunks.length} results for query: "${query}"`);
      }
    } catch (error) {
      logger.warn(`RAG retrieval failed, falling back to in-memory store: ${error}`);
      chunks = this.memoryStore.search(query, topK, domain);
    }

    // Filter by minimum score
    const filteredChunks = chunks.filter((c) => c.score >= config.RAG_MIN_SCORE);
    const finalChunks = filteredChunks.length > 0 ? filteredChunks : chunks.slice(0, 3);

    // Build context text for injection into the model prompt
    const contextText = finalChunks
      .map((chunk, i) =>
        `[Source ${i + 1}: ${chunk.title} (${chunk.domain})]\n${chunk.content}`
      )
      .join("\n\n---\n\n");

    return {
      chunks: finalChunks,
      query,
      domain: domain || "general",
      totalRetrieved: finalChunks.length,
      contextText,
    };
  }

  /**
   * Retrieve context for multiple domains in parallel
   */
  async retrieveMultiDomain(
    query: string,
    domains: string[]
  ): Promise<Map<string, RAGContext>> {
    const results = await Promise.all(
      domains.map(async (domain) => {
        const context = await this.retrieve(query, domain);
        return [domain, context] as [string, RAGContext];
      })
    );
    return new Map(results);
  }
}
