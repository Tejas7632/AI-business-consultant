/**
 * Knowledge Base Unit Tests
 */

import {
  ALL_KNOWLEDGE_DOCS,
  KNOWLEDGE_BASE_META,
  MARKET_RESEARCH_DOCS,
  FUNDING_DOCS,
  GOVERNMENT_SCHEMES_DOCS,
  LEGAL_DOCS,
  REVENUE_MODEL_DOCS,
  COMPETITOR_DOCS,
  RISK_DOCS,
  INCUBATOR_DOCS,
  GTM_DOCS,
} from "../knowledge-base/knowledge-docs.js";

describe("Knowledge Base", () => {
  test("all document arrays are non-empty", () => {
    expect(MARKET_RESEARCH_DOCS.length).toBeGreaterThan(0);
    expect(FUNDING_DOCS.length).toBeGreaterThan(0);
    expect(GOVERNMENT_SCHEMES_DOCS.length).toBeGreaterThan(0);
    expect(LEGAL_DOCS.length).toBeGreaterThan(0);
    expect(REVENUE_MODEL_DOCS.length).toBeGreaterThan(0);
    expect(COMPETITOR_DOCS.length).toBeGreaterThan(0);
    expect(RISK_DOCS.length).toBeGreaterThan(0);
    expect(INCUBATOR_DOCS.length).toBeGreaterThan(0);
    expect(GTM_DOCS.length).toBeGreaterThan(0);
  });

  test("ALL_KNOWLEDGE_DOCS aggregates all domain documents", () => {
    const total =
      MARKET_RESEARCH_DOCS.length +
      FUNDING_DOCS.length +
      GOVERNMENT_SCHEMES_DOCS.length +
      LEGAL_DOCS.length +
      REVENUE_MODEL_DOCS.length +
      COMPETITOR_DOCS.length +
      RISK_DOCS.length +
      INCUBATOR_DOCS.length +
      GTM_DOCS.length;
    expect(ALL_KNOWLEDGE_DOCS.length).toBe(total);
  });

  test("all documents have required fields", () => {
    ALL_KNOWLEDGE_DOCS.forEach((doc) => {
      expect(doc.id).toBeTruthy();
      expect(doc.domain).toBeTruthy();
      expect(doc.title).toBeTruthy();
      expect(doc.content.length).toBeGreaterThan(100);
      expect(Array.isArray(doc.tags)).toBe(true);
      expect(doc.tags.length).toBeGreaterThan(0);
    });
  });

  test("document IDs are unique", () => {
    const ids = ALL_KNOWLEDGE_DOCS.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("metadata totalDocuments matches actual count", () => {
    expect(KNOWLEDGE_BASE_META.totalDocuments).toBe(ALL_KNOWLEDGE_DOCS.length);
  });

  test("all documents have valid domain values", () => {
    const validDomains = new Set(KNOWLEDGE_BASE_META.domains);
    ALL_KNOWLEDGE_DOCS.forEach((doc) => {
      expect(validDomains.has(doc.domain)).toBe(true);
    });
  });
});
