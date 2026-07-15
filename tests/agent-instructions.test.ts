/**
 * Agent Instructions Unit Tests
 */

import { AGENT_INSTRUCTIONS } from "../src/config/agent-instructions.js";

describe("AGENT_INSTRUCTIONS", () => {
  test("all 12 sections are defined and enabled by default", () => {
    const sections = AGENT_INSTRUCTIONS.SCOPE.sections;
    const sectionKeys = Object.keys(sections);
    expect(sectionKeys).toHaveLength(12);

    sectionKeys.forEach((key) => {
      expect(sections[key as keyof typeof sections].enabled).toBe(true);
    });
  });

  test("sections are ordered 1-12 without gaps", () => {
    const orders = Object.values(AGENT_INSTRUCTIONS.SCOPE.sections)
      .map((s) => s.order)
      .sort((a, b) => a - b);
    orders.forEach((order, idx) => {
      expect(order).toBe(idx + 1);
    });
  });

  test("all section prompts are defined and non-empty", () => {
    const sectionKeys = Object.keys(AGENT_INSTRUCTIONS.SCOPE.sections);
    sectionKeys.forEach((key) => {
      const prompt = AGENT_INSTRUCTIONS.SECTION_PROMPTS[key as keyof typeof AGENT_INSTRUCTIONS.SECTION_PROMPTS];
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(50);
    });
  });

  test("system prompt is defined and non-empty", () => {
    expect(AGENT_INSTRUCTIONS.SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  test("all 10 RAG knowledge domains are listed", () => {
    expect(AGENT_INSTRUCTIONS.RAG_STRATEGY.knowledgeDomains).toHaveLength(10);
  });

  test("persona has required fields", () => {
    const { PERSONA } = AGENT_INSTRUCTIONS;
    expect(PERSONA.name).toBeTruthy();
    expect(PERSONA.role).toBeTruthy();
    expect(PERSONA.expertise.length).toBeGreaterThan(0);
  });

  test("all three disclaimer types are defined", () => {
    const { disclaimers } = AGENT_INSTRUCTIONS.CONSTRAINTS;
    expect(disclaimers.legal).toBeTruthy();
    expect(disclaimers.financial).toBeTruthy();
    expect(disclaimers.general).toBeTruthy();
  });
});
