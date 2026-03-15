import { ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import type { Settings } from "../../../../../shared/types";

const PROVIDER_OPTIONS = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "groq", label: "Groq" },
];

export function useSettings() {
  const provider = ref<Settings["provider"]>("anthropic");
  const apiKey = ref("");
  const saved = ref(false);

  const { isLoading } = useAsyncState(async () => {
    const settings = await window.electronAPI.getSettings();
    provider.value = settings.provider;
    apiKey.value = settings.apiKey;
  }, undefined);

  async function save() {
    await window.electronAPI.saveSettings({ provider: provider.value, apiKey: apiKey.value });
    saved.value = true;
    setTimeout(() => (saved.value = false), 2000);
  }

  return { provider, apiKey, saved, loading: isLoading, save, providerOptions: PROVIDER_OPTIONS };
}
