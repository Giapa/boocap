import Store from "electron-store";
import type { Settings } from "../../shared/types";
import {
  sanitizeSettings,
  validateSettingsForSummarization,
  validateStoredSettings,
} from "./settingsValidation";

const defaults: Settings = {
  provider: "anthropic",
  apiKey: "",
};

const store = new Store<{ settings: Settings }>({
  defaults: { settings: defaults },
});

export function getSettings(): Settings {
  return sanitizeSettings(store.get("settings"));
}

export function saveSettings(settings: Settings): void {
  const sanitized = sanitizeSettings(settings);

  validateStoredSettings(sanitized);
  store.set("settings", sanitized);
}

export function getSettingsForSummarization(): Settings {
  const settings = getSettings();

  validateSettingsForSummarization(settings);
  return settings;
}
