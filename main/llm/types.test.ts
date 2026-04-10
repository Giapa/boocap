import { describe, expect, it } from "vitest";
import { buildPrompt, estimateTokens, FAMILY_RELATION_VALUES, prepareChapterText } from "./types";

describe("prompt preparation", () => {
  it("removes a repeated chapter title from the start of the text", () => {
    const prepared = prepareChapterText(
      "Chapter One",
      "Chapter One\n\nThis is the actual story content.",
    );

    expect(prepared.text.startsWith("Chapter One")).toBe(false);
    expect(prepared.savedCharacters).toBeGreaterThan(0);
  });

  it("truncates overly long chapters", () => {
    const prepared = prepareChapterText("Long Chapter", `Intro ${"a".repeat(12000)}`);

    expect(prepared.preparedCharacters).toBeLessThan(prepared.originalCharacters);
    expect(prepared.preparedCharacters).toBeLessThanOrEqual(9000);
  });

  it("builds a compact prompt and estimates tokens", () => {
    const prompt = buildPrompt("Chapter Two", "Plot beats go here.");

    expect(prompt).toContain("Chapter title: Chapter Two");
    expect(prompt).toContain('"familyRelations"');
    expect(prompt).toContain(FAMILY_RELATION_VALUES.join(", "));
    expect(estimateTokens(prompt)).toBeGreaterThan(0);
  });
});
