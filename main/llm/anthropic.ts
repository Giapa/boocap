import type { LLMProvider } from "./types";
import { buildPrompt } from "./types";
import { parseAnthropicText, parseChapterAnalysisText } from "./parsing";

export class AnthropicProvider implements LLMProvider {
  constructor(private apiKey: string) {}

  async analyzeChapter(chapterTitle: string, chapterText: string) {
    const prompt = buildPrompt(chapterTitle, chapterText);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${body}`);
    }

    return parseChapterAnalysisText(parseAnthropicText(await response.json()));
  }
}
