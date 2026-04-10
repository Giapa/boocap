import { describe, expect, it } from "vitest";
import {
  sanitizeSettings,
  validateSettingsForSummarization,
  validateStoredSettings,
} from "./settingsValidation";

describe("settingsValidation", () => {
  it("trims the api key while preserving a valid provider", () => {
    expect(
      sanitizeSettings({
        provider: "openai",
        apiKey: "  secret-key  ",
      }),
    ).toEqual({
      provider: "openai",
      apiKey: "secret-key",
    });
  });

  it("throws when summarization settings are missing an api key", () => {
    expect(() =>
      validateSettingsForSummarization({
        provider: "anthropic",
        apiKey: "",
      }),
    ).toThrow("Configure an API key");
  });

  it("accepts valid stored settings", () => {
    expect(() =>
      validateStoredSettings({
        provider: "groq",
        apiKey: "",
      }),
    ).not.toThrow();
  });
});
