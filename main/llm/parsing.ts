import type {
  ChapterAnalysis,
  ChapterFamilyRelation,
  FamilyRelationType,
  RelationConfidence,
} from "../../shared/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function expectRecord(value: unknown, message: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(message);
  }

  return value;
}

function expectArray(value: unknown, message: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(message);
  }

  return value;
}

function expectString(value: unknown, message: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }

  return value.trim();
}

function normalizeRelationship(value: string): FamilyRelationType | null {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s/-]+/g, "_");

  switch (normalized) {
    case "parent":
    case "spouse":
    case "sibling":
    case "grandparent":
    case "aunt_uncle":
    case "cousin":
    case "guardian":
      return normalized;
    default:
      return null;
  }
}

function normalizeConfidence(value: unknown): RelationConfidence {
  if (typeof value !== "string") {
    return "medium";
  }

  switch (value.trim().toLowerCase()) {
    case "low":
    case "medium":
    case "high":
      return value.trim().toLowerCase() as RelationConfidence;
    default:
      return "medium";
  }
}

function extractJsonBlock(text: string): string {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("LLM response did not contain JSON.");
  }

  return text.slice(firstBrace, lastBrace + 1).trim();
}

function parseFamilyRelations(value: unknown): ChapterFamilyRelation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const relations: ChapterFamilyRelation[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const sourceCharacter =
      typeof item.sourceCharacter === "string" ? item.sourceCharacter.trim() : "";
    const targetCharacter =
      typeof item.targetCharacter === "string" ? item.targetCharacter.trim() : "";
    const evidence = typeof item.evidence === "string" ? item.evidence.trim() : "";
    const relationship =
      typeof item.relationship === "string" ? normalizeRelationship(item.relationship) : null;

    if (
      sourceCharacter.length === 0 ||
      targetCharacter.length === 0 ||
      evidence.length === 0 ||
      !relationship ||
      sourceCharacter === targetCharacter
    ) {
      continue;
    }

    const key = `${sourceCharacter.toLowerCase()}:${relationship}:${targetCharacter.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    relations.push({
      sourceCharacter,
      targetCharacter,
      relationship,
      evidence,
      confidence: normalizeConfidence(item.confidence),
    });
  }

  return relations;
}

export function parseAnthropicText(data: unknown): string {
  const record = expectRecord(data, "Anthropic response was not an object.");
  const content = expectArray(record.content, "Anthropic response did not include content.");

  for (const item of content) {
    if (!isRecord(item) || item.type !== "text") {
      continue;
    }

    return expectString(item.text, "Anthropic response contained an empty text block.");
  }

  throw new Error("Anthropic response did not include a text summary.");
}

export function parseChatCompletionText(data: unknown, providerName: string): string {
  const record = expectRecord(data, `${providerName} response was not an object.`);
  const choices = expectArray(record.choices, `${providerName} response did not include choices.`);
  const firstChoice = expectRecord(
    choices[0],
    `${providerName} response did not include a first choice.`,
  );
  const message = expectRecord(
    firstChoice.message,
    `${providerName} response did not include a message payload.`,
  );

  return expectString(message.content, `${providerName} response contained an empty summary.`);
}

export function parseGoogleText(data: unknown): string {
  const record = expectRecord(data, "Google response was not an object.");
  const candidates = expectArray(record.candidates, "Google response did not include candidates.");
  const firstCandidate = expectRecord(
    candidates[0],
    "Google response did not include a candidate payload.",
  );
  const content = expectRecord(
    firstCandidate.content,
    "Google response did not include candidate content.",
  );
  const parts = expectArray(content.parts, "Google response did not include content parts.");
  const firstPart = expectRecord(parts[0], "Google response did not include a text part.");

  return expectString(firstPart.text, "Google response contained an empty summary.");
}

export function parseChapterAnalysisText(text: string): ChapterAnalysis {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonBlock(text));
  } catch (error) {
    throw new Error(
      `LLM response could not be parsed as chapter analysis JSON: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }

  const record = expectRecord(parsed, "Chapter analysis response was not an object.");

  return {
    summary: expectString(record.summary, "Chapter analysis did not include a summary."),
    familyRelations: parseFamilyRelations(record.familyRelations),
  };
}
