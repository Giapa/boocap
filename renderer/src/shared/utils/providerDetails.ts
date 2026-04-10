import type { Settings } from "../../../../shared/types";

interface ProviderDetails {
  title: string;
  description: string;
  helpText: string;
  keyHint: string;
}

const PROVIDER_DETAILS: Record<Settings["provider"], ProviderDetails> = {
  anthropic: {
    title: "Anthropic",
    description: "Fast narrative summaries with strong chapter-level recall.",
    helpText: "Recommended when you want balanced quality and latency.",
    keyHint: "Paste your Anthropic API key. It is stored locally on this device.",
  },
  openai: {
    title: "OpenAI",
    description: "Reliable general-purpose summaries with broad model availability.",
    helpText: "Useful if you already route most AI work through OpenAI.",
    keyHint: "Paste your OpenAI API key. It is stored locally on this device.",
  },
  google: {
    title: "Google",
    description: "Good throughput for long-form text with the Gemini models.",
    helpText: "A solid option when you want speed and competitive pricing.",
    keyHint: "Paste your Google AI Studio API key. It is stored locally on this device.",
  },
  groq: {
    title: "Groq",
    description: "Lowest-latency option in this app, useful for fast chapter passes.",
    helpText: "Best when quick iteration matters more than richer model options.",
    keyHint: "Paste your Groq API key. It is stored locally on this device.",
  },
};

export function getProviderDetails(provider: Settings["provider"]): ProviderDetails {
  return PROVIDER_DETAILS[provider];
}
