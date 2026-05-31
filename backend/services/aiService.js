'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'gemini-2.5-flash';

const GENERATION_CONFIG = {
  responseMimeType: 'application/json',
  temperature: 0.7,
  maxOutputTokens: 65536,
};

const SYSTEM_INSTRUCTION = `You are ArchMind, an expert system architect and UI/UX designer with 20 years of experience designing systems for Google, Netflix, Uber, and Amazon.

When given product requirements, you generate a COMPLETE system design including architecture, database, APIs, and UI/UX blueprints.

You MUST respond with ONLY a valid JSON object. No markdown, no explanation, no preamble. Just the raw JSON.

The JSON must follow this exact schema:
{
  "title": "string",
  "summary": "string — 2-3 sentence executive summary containing extracted Entities, core Features, and Scale requirements",
  "hld": {
    "summary": "string — Detailed HLD description highlighting component interactions",
    "nodes": [{"id":"string","type":"service|database|gateway|queue|cache|client|cdn|lb","label":"string","description":"string","technology":"string","position":{"x":0,"y":0}}],
    "edges": [{"id":"string","source":"string","target":"string","label":"string — detailed data flow representation","animated":true}],
    "scalabilityNotes": ["string"],
    "tradeoffs": [{"pro":"string","con":"string"}]
  },
  "lld": {
    "services": [{"name":"string","responsibility":"string","technology":"string","endpoints":[{"method":"GET|POST|PUT|DELETE|PATCH","path":"string","description":"string","auth":true,"requestBody":{},"response":{}}],"dependencies":["string"]}],
    "classes": [{"name":"string","methods":[{"name":"string","parameters":["string"],"returnType":"string","description":"string"}],"interactions":["string"]}],
    "classDiagram": "string — Mermaid-compatible or textual representation of LLD class structure and relationships",
    "logic": "string — Detailed explanation of class interactions, method flow logic, and execution steps"
  },
  "database": {
    "type":"string",
    "rationale":"string",
    "tables":[{"name":"string","columns":[{"name":"string","type":"string","constraints":["string"],"isPrimary":true,"isForeign":true}],"indexes":["string"],"relations":[{"target":"string","type":"1:1|1:N|N:M","on":"string"}]}],
    "cachingStrategy":"string — Detailed database caching policy",
    "shardingStrategy":"string — Detailed database sharding policy",
    "indexingRecommendations": ["string — Specific table/column indexes with rationale"],
    "scalingStrategy": "string — Strategy for vertical/horizontal scaling, partitioning, and read replicas"
  },
  "scalability": {
    "loadBalancing":"string",
    "caching":[{"layer":"string","technology":"string","strategy":"string"}],
    "sharding":"string",
    "cdnStrategy":"string",
    "estimatedRPS":1000,
    "estimatedUsers":"string",
    "autoScaling":"string — Detailed load thresholds, auto-scaling parameters, and serverless thresholds",
    "stressPoints":[{"at":"string","issue":"string"}]
  },
  "uiux": {
    "userFlows":[{"id":"string","name":"string","steps":[{"id":"string","screen":"string","action":"string","next":"string"}]}],
    "screens":[{"name":"string","purpose":"string","layout":"string","sections":[{"type":"string","label":"string","content":"string"}],"keyInteractions":["string"],"a11yNotes":["string"]}],
    "components":[{"group":"string","name":"string","description":"string","complexity":"Simple|Medium|Complex","reusable":true}],
    "designSystem":{"colors":{"primary":"#hex","secondary":"#hex","accent":"#hex","success":"#22c55e","warning":"#f59e0b","error":"#ef4444","neutral":"#6b7280","background":"#hex","surface":"#hex","text":"#hex"},"typography":{"headingFont":"string","bodyFont":"string","scale":{"xs":"12px","sm":"14px","base":"16px","lg":"18px","xl":"24px","2xl":"32px","3xl":"48px"}},"spacing":{"base":"4px","scale":[4,8,12,16,24,32,48,64,96,128]},"borderRadius":{"sm":"4px","md":"8px","lg":"12px","xl":"16px","full":"9999px"},"rationale":"string"}
  },
  "challengeMode": {
    "bottlenecks":[{"title":"string","description":"string","severity":"high|medium|low","fix":"string"}],
    "spofs":[{"title":"string","description":"string","severity":"high|medium|low","fix":"string"}],
    "recommendations":[{"title":"string","description":"string","impact":"high|medium|low"}]
  },
  "systemFlow": "string — Detailed end-to-end data walkthrough describing flow of data with arrows (e.g. User -> CDN -> Gateway -> Auth Service)",
  "designDecisions": [{"decision":"string","rationale":"string","alternatives":["string"],"tradeoffs":"string"}],
  "failureHandling": [{"scenario":"string","mitigation":"string","strategy":"retries|circuit breaker|fallback|backpressure","details":"string"}],
  "security": [{"threat":"string","control":"string","implementation":"string"}],
  "observability": [{"component":"string","metrics":["string"],"logging":"string","alerts":["string"]}]
}

IMPORTANT RULES:
1. Position nodes logically: clients at top (y: 100), gateways middle (y: 300), services below (y: 500), databases bottom (y: 700). Space horizontally with spacious x: 350 gaps starting at x: 100 (e.g. x: 100, 450, 800, 1150, 1500).
2. Generate at minimum: 8 HLD nodes, 3 LLD services, 4 DB tables, 6 API endpoints, 3 screens, 10 components.
3. Be specific to the product — tailor everything to the actual requirements given.
4. Design system colors should match the product personality.
5. Bottlenecks and SPOFs must be real issues with the generated design, not generic.
6. ONLY return JSON. Any text outside the JSON object will break the parser.
7. APIs MUST have fully populated requestBody and response schemas that are valid JSON objects detailing parameters and fields, not generic or empty.
8. Extract Entities, Features, and Scale requirements and weave them explicitly into the summary and systemFlow.
9. Failure handling mitigation details must contain specific timeout thresholds, retry counts, and fallback actions.`;

const CHALLENGE_SYSTEM_INSTRUCTION = `You are ArchMind, an expert system architect specializing in resilience engineering and failure analysis.

Your job is to critically analyze an existing system design and identify:
1. Performance bottlenecks — places where the system will slow down or fail under load
2. Single points of failure (SPOFs) — components whose failure would bring down the system
3. Improvement recommendations — actionable steps to make the system more resilient

You MUST respond with ONLY a valid JSON object. No markdown, no explanation, no preamble. Just the raw JSON.

The JSON must follow this exact schema:
{
  "bottlenecks": [{"title":"string","description":"string","severity":"high|medium|low","fix":"string"}],
  "spofs": [{"title":"string","description":"string","severity":"high|medium|low","fix":"string"}],
  "recommendations": [{"title":"string","description":"string","impact":"high|medium|low"}]
}

RULES:
1. Find at minimum: 3 bottlenecks, 3 SPOFs, 5 recommendations.
2. Be specific to the provided design — reference actual component names and technologies.
3. Severity/impact must reflect real production risk.
4. Fixes must be concrete engineering solutions, not platitudes.
5. ONLY return JSON.`;

// ─── JSON Repair Utility ──────────────────────────────────────────────────────

/**
 * Attempts to extract and parse JSON from a potentially malformed AI response.
 * Handles cases where the model wraps JSON in markdown code blocks.
 *
 * @param {string} text - Raw text from AI response
 * @returns {object} Parsed JSON object
 * @throws {Error} If JSON cannot be extracted or parsed
 */
function tryRepairJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('AI response was empty or not a string.');
  }

  const trimmed = text.trim();

  // Attempt 1: Direct parse
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    // Continue to repair attempts
  }

  // Attempt 2: Strip markdown JSON fences ```json ... ```
  const jsonFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (jsonFenceMatch && jsonFenceMatch[1]) {
    try {
      return JSON.parse(jsonFenceMatch[1].trim());
    } catch (_) {
      // Continue
    }
  }

  // Attempt 3: Extract first { ... } block
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // Continue
    }
  }

  // Attempt 4: Extract first [ ... ] block (for array responses)
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.slice(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // Continue
    }
  }

  throw new Error(
    `Unable to parse AI response as JSON after repair attempts. Response preview: "${trimmed.slice(0, 200)}..."`
  );
}

// ─── validateDesignShape ──────────────────────────────────────────────────────

/**
 * Light validation to ensure the AI returned the expected top-level structure.
 * Throws if critical sections are missing.
 *
 * @param {object} parsed
 */
function validateDesignShape(parsed) {
  const required = ['title', 'summary', 'hld', 'lld', 'database', 'scalability', 'uiux', 'challengeMode'];
  const missing = required.filter((key) => !(key in parsed));
  if (missing.length > 0) {
    throw new Error(
      `AI response is missing required top-level fields: ${missing.join(', ')}. The model may have truncated its response.`
    );
  }

  if (!Array.isArray(parsed.hld?.nodes) || parsed.hld.nodes.length < 1) {
    throw new Error('AI response is missing HLD nodes.');
  }

  if (!Array.isArray(parsed.lld?.services) || parsed.lld.services.length < 1) {
    throw new Error('AI response is missing LLD services.');
  }
}

// ─── generateDesign ───────────────────────────────────────────────────────────

/**
 * Generate a complete system design blueprint using Gemini AI.
 *
 * @param {{ productName: string, requirements: string, constraints: { scale: string, budget: string, techPreferences: string[], expectedUsers: string } }} params
 * @returns {Promise<object>} Parsed design object matching the full schema
 */
async function generateDesign({ productName, requirements, constraints = {} }) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: GENERATION_CONFIG,
  });

  const techPrefsText =
    Array.isArray(constraints.techPreferences) && constraints.techPreferences.length > 0
      ? constraints.techPreferences.join(', ')
      : 'No specific preferences';

  const userPrompt = `Design a complete system for: ${productName}

Requirements: ${requirements}

Constraints:
- Scale: ${constraints.scale || 'Not specified'}
- Budget: ${constraints.budget || 'Not specified'}
- Expected Users: ${constraints.expectedUsers || 'Not specified'}
- Tech Preferences: ${techPrefsText}`;

  let rawText;
  try {
    const result = await model.generateContent(userPrompt);
    rawText = result.response.text();
  } catch (aiErr) {
    const message = aiErr?.message || String(aiErr);
    if (message.includes('API_KEY')) {
      throw new Error('Invalid or missing Gemini API key. Please check your GEMINI_API_KEY environment variable.');
    }
    if (message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini API quota exceeded. Please try again later or upgrade your Gemini plan.');
    }
    if (message.includes('SAFETY')) {
      throw new Error('The AI refused to generate this content due to safety filters. Please modify your requirements.');
    }
    throw new Error(`Gemini API error: ${message}`);
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  let parsed;
  try {
    parsed = tryRepairJSON(rawText);
  } catch (parseErr) {
    throw new Error(`Failed to parse AI response as JSON. ${parseErr.message}`);
  }

  try {
    validateDesignShape(parsed);
  } catch (validationErr) {
    throw new Error(`AI response validation failed. ${validationErr.message}`);
  }

  return parsed;
}

// ─── generateChallenge ────────────────────────────────────────────────────────

/**
 * Analyze an existing design for bottlenecks, SPOFs, and improvement recommendations.
 *
 * @param {{ hld: object, lld: object, database: object }} existingDesign
 * @returns {Promise<{ bottlenecks: object[], spofs: object[], recommendations: object[] }>}
 */
async function generateChallenge(existingDesign) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: CHALLENGE_SYSTEM_INSTRUCTION,
    generationConfig: {
      ...GENERATION_CONFIG,
      temperature: 0.5, // Slightly lower temp for more deterministic analysis
      maxOutputTokens: 16384,
    },
  });

  const hldSummary = {
    summary: existingDesign.hld?.summary,
    nodes: existingDesign.hld?.nodes,
    edges: existingDesign.hld?.edges,
    scalabilityNotes: existingDesign.hld?.scalabilityNotes,
  };

  const userPrompt = `Analyze this system design and find ALL bottlenecks, single points of failure, and provide improvement recommendations:

Architecture (HLD): ${JSON.stringify(hldSummary, null, 2)}

Services (LLD): ${JSON.stringify(existingDesign.lld, null, 2)}

Database: ${JSON.stringify(existingDesign.database, null, 2)}`;

  let rawText;
  try {
    const result = await model.generateContent(userPrompt);
    rawText = result.response.text();
  } catch (aiErr) {
    const message = aiErr?.message || String(aiErr);
    throw new Error(`Gemini Challenge API error: ${message}`);
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Gemini returned an empty challenge response. Please try again.');
  }

  let parsed;
  try {
    parsed = tryRepairJSON(rawText);
  } catch (parseErr) {
    throw new Error(`Failed to parse challenge response as JSON. ${parseErr.message}`);
  }

  // Ensure all required arrays exist, default to empty if AI omitted them
  return {
    bottlenecks: Array.isArray(parsed.bottlenecks) ? parsed.bottlenecks : [],
    spofs: Array.isArray(parsed.spofs) ? parsed.spofs : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { generateDesign, generateChallenge };
