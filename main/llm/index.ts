import type { Settings } from "../../shared/types";
import type { LLMProvider } from "./types";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { GoogleProvider } from "./google";
import { GroqProvider } from "./groq";

export type { LLMProvider } from "./types";

export function createProvider(settings: Settings): LLMProvider {
  if (!settings.apiKey) {
    throw new Error("API key is not configured. Please set it in Settings.");
  }

  switch (settings.provider) {
    case "anthropic":
      return new AnthropicProvider(settings.apiKey);
    case "openai":
      return new OpenAIProvider(settings.apiKey);
    case "google":
      return new GoogleProvider(settings.apiKey);
    case "groq":
      return new GroqProvider(settings.apiKey);
  }
}
