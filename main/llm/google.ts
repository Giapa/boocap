import type { LLMProvider } from "./types";
import { buildPrompt } from "./types";
import { parseChapterAnalysisText, parseGoogleText } from "./parsing";

export class GoogleProvider implements LLMProvider {
  constructor(private apiKey: string) {}

  async analyzeChapter(chapterTitle: string, chapterText: string) {
    const prompt = buildPrompt(chapterTitle, chapterText);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Google API error (${response.status}): ${body}`);
    }

    return parseChapterAnalysisText(parseGoogleText(await response.json()));
  }
}
