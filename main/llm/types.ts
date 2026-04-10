import type { ChapterAnalysis, FamilyRelationType } from "../../shared/types";

export interface LLMProvider {
  analyzeChapter(chapterTitle: string, chapterText: string): Promise<ChapterAnalysis>;
}

export interface PreparedChapterText {
  text: string;
  originalCharacters: number;
  preparedCharacters: number;
  savedCharacters: number;
}

const MAX_CHAPTER_LENGTH = 9000;
export const FAMILY_RELATION_VALUES: FamilyRelationType[] = [
  "parent",
  "spouse",
  "sibling",
  "grandparent",
  "aunt_uncle",
  "cousin",
  "guardian",
];

function stripRepeatedTitle(chapterTitle: string, chapterText: string): string {
  const trimmedTitle = chapterTitle.trim();
  const trimmedText = chapterText.trim();

  if (trimmedTitle.length === 0 || trimmedText.length === 0) {
    return trimmedText;
  }

  const lowerTitle = trimmedTitle.toLowerCase();
  const lowerText = trimmedText.toLowerCase();

  if (!lowerText.startsWith(lowerTitle)) {
    return trimmedText;
  }

  const remainder = trimmedText.slice(trimmedTitle.length).trimStart();
  return remainder.length > 0 ? remainder : trimmedText;
}

function truncateAtBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const candidate = text.slice(0, maxLength);
  const boundaryIndexes = [candidate.lastIndexOf("\n\n")];

  for (const separator of [". ", "! ", "? "]) {
    boundaryIndexes.push(candidate.lastIndexOf(separator));
  }

  const bestBoundary = Math.max(...boundaryIndexes);

  if (bestBoundary >= Math.floor(maxLength * 0.6)) {
    return candidate.slice(0, bestBoundary + 1).trimEnd();
  }

  return candidate.trimEnd();
}

export function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.trim().length / 4));
}

export function prepareChapterText(chapterTitle: string, chapterText: string): PreparedChapterText {
  const withoutRepeatedTitle = stripRepeatedTitle(chapterTitle, chapterText);
  const truncated = truncateAtBoundary(withoutRepeatedTitle, MAX_CHAPTER_LENGTH);

  return {
    text: truncated,
    originalCharacters: chapterText.length,
    preparedCharacters: truncated.length,
    savedCharacters: Math.max(0, chapterText.length - truncated.length),
  };
}

export function buildPrompt(chapterTitle: string, chapterText: string): string {
  return [
    "Analyze this book chapter and return strict JSON with no markdown.",
    'Use this exact JSON shape: {"summary":"...","familyRelations":[{"sourceCharacter":"...","targetCharacter":"...","relationship":"parent","evidence":"...","confidence":"high"}]}.',
    `Allowed relationship values: ${FAMILY_RELATION_VALUES.join(", ")}.`,
    "Rules:",
    "- The summary must be concise, factual, and capture major actions, conflicts, and reveals.",
    "- Only include explicit or directly revealed family relationships from this chapter.",
    "- The relationship value always describes sourceCharacter in relation to targetCharacter.",
    "- Use an empty array when no family relationships are stated.",
    "- Keep evidence short and specific to the chapter.",
    "",
    `Chapter title: ${chapterTitle}`,
    chapterText,
  ].join("\n");
}
