import type { Settings } from "../../shared/types";

const VALID_PROVIDERS = ["anthropic", "openai", "google", "groq"] as const;

function isProvider(value: string): value is Settings["provider"] {
  return VALID_PROVIDERS.includes(value as Settings["provider"]);
}

export function sanitizeSettings(settings: Settings): Settings {
  return {
    provider: isProvider(settings.provider) ? settings.provider : "anthropic",
    apiKey: settings.apiKey.trim(),
  };
}

export function validateStoredSettings(settings: Settings): void {
  if (!isProvider(settings.provider)) {
    throw new Error("Unsupported provider selected.");
  }
}

export function validateSettingsForSummarization(settings: Settings): void {
  validateStoredSettings(settings);

  if (settings.apiKey.length === 0) {
    throw new Error("Configure an API key in Settings before uploading a book.");
  }
}
