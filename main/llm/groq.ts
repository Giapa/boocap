import type { LLMProvider } from "./types";
import { buildPrompt } from "./types";
import { parseChapterAnalysisText, parseChatCompletionText } from "./parsing";

export class GroqProvider implements LLMProvider {
  constructor(private apiKey: string) {}

  async analyzeChapter(chapterTitle: string, chapterText: string) {
    const prompt = buildPrompt(chapterTitle, chapterText);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq API error (${response.status}): ${body}`);
    }

    return parseChapterAnalysisText(parseChatCompletionText(await response.json(), "Groq"));
  }
}
