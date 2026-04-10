import { describe, expect, it } from "vitest";
import {
  parseAnthropicText,
  parseChapterAnalysisText,
  parseChatCompletionText,
  parseGoogleText,
} from "./parsing";

describe("llm response parsing", () => {
  it("extracts anthropic text blocks", () => {
    expect(
      parseAnthropicText({
        content: [{ type: "text", text: "Chapter summary" }],
      }),
    ).toBe("Chapter summary");
  });

  it("extracts openai style chat completions", () => {
    expect(
      parseChatCompletionText(
        {
          choices: [{ message: { content: "Concise summary" } }],
        },
        "OpenAI",
      ),
    ).toBe("Concise summary");
  });

  it("extracts google candidate text", () => {
    expect(
      parseGoogleText({
        candidates: [
          {
            content: {
              parts: [{ text: "Google summary" }],
            },
          },
        ],
      }),
    ).toBe("Google summary");
  });

  it("rejects empty provider summaries", () => {
    expect(() =>
      parseChatCompletionText(
        {
          choices: [{ message: { content: "" } }],
        },
        "Groq",
      ),
    ).toThrow("Groq response contained an empty summary");
  });

  it("parses structured chapter analysis JSON", () => {
    expect(
      parseChapterAnalysisText(`
        {
          "summary": "Arya learns more about her family.",
          "familyRelations": [
            {
              "sourceCharacter": "Eddard Stark",
              "targetCharacter": "Arya Stark",
              "relationship": "parent",
              "evidence": "Ned is identified as Arya's father.",
              "confidence": "high"
            }
          ]
        }
      `),
    ).toEqual({
      summary: "Arya learns more about her family.",
      familyRelations: [
        {
          sourceCharacter: "Eddard Stark",
          targetCharacter: "Arya Stark",
          relationship: "parent",
          evidence: "Ned is identified as Arya's father.",
          confidence: "high",
        },
      ],
    });
  });

  it("accepts fenced JSON and ignores malformed relations", () => {
    expect(
      parseChapterAnalysisText(
        [
          "```json",
          "{",
          '  "summary": "A short summary.",',
          '  "familyRelations": [',
          "    {",
          '      "sourceCharacter": "Elain Archeron",',
          '      "targetCharacter": "Nesta Archeron",',
          '      "relationship": "sibling",',
          '      "evidence": "They are referred to as sisters.",',
          '      "confidence": "medium"',
          "    },",
          "    {",
          '      "sourceCharacter": "",',
          '      "targetCharacter": "Invalid",',
          '      "relationship": "unknown",',
          '      "evidence": "Bad",',
          '      "confidence": "low"',
          "    }",
          "  ]",
          "}",
          "```",
        ].join("\n"),
      ),
    ).toEqual({
      summary: "A short summary.",
      familyRelations: [
        {
          sourceCharacter: "Elain Archeron",
          targetCharacter: "Nesta Archeron",
          relationship: "sibling",
          evidence: "They are referred to as sisters.",
          confidence: "medium",
        },
      ],
    });
  });
});
