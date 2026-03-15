import { ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useNotification } from "../../../shared/composables/useNotification";
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
  const { show: showNotification } = useNotification();

  const { isLoading } = useAsyncState(async () => {
    const settings = await window.electronAPI.getSettings();
    provider.value = settings.provider;
    apiKey.value = settings.apiKey;
  }, undefined);

  async function save() {
    await window.electronAPI.saveSettings({ provider: provider.value, apiKey: apiKey.value });
    showNotification("Settings saved", "success", 2000);
  }

  return { provider, apiKey, loading: isLoading, save, providerOptions: PROVIDER_OPTIONS };
}
