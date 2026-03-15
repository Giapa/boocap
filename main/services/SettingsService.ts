import Store from "electron-store";
import type { Settings } from "../../shared/types";

const defaults: Settings = {
  provider: "anthropic",
  apiKey: "",
};

const store = new Store<{ settings: Settings }>({
  defaults: { settings: defaults },
});

export function getSettings(): Settings {
  return store.get("settings");
}

export function saveSettings(settings: Settings): void {
  store.set("settings", settings);
}
