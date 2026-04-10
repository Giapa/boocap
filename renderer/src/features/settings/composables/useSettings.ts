import { computed, ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useNotification } from "../../../shared/composables/useNotification";
import type { Settings } from "../../../../../shared/types";
import { getErrorMessage } from "../../../../../shared/utils/errors";
import { getProviderDetails } from "../../../shared/utils/providerDetails";

const PROVIDER_OPTIONS = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "groq", label: "Groq" },
];

export function useSettings() {
  const provider = ref<Settings["provider"]>("anthropic");
  const apiKey = ref("");
  const saving = ref(false);
  const { show: showNotification } = useNotification();

  const { isLoading } = useAsyncState(async () => {
    const settings = await window.electronAPI.getSettings();
    provider.value = settings.provider;
    apiKey.value = settings.apiKey;
  }, undefined);

  const providerDetails = computed(() => getProviderDetails(provider.value));
  const validationMessage = computed(() => {
    if (apiKey.value.trim().length > 0) {
      return "";
    }

    return "Uploads are blocked until you add an API key for the selected provider.";
  });

  async function save() {
    saving.value = true;

    try {
      await window.electronAPI.saveSettings({ provider: provider.value, apiKey: apiKey.value });
      showNotification("Settings saved", "success", 2000);
    } catch (e) {
      showNotification(getErrorMessage(e, "Failed to save settings"), "error");
    } finally {
      saving.value = false;
    }
  }

  return {
    provider,
    apiKey,
    loading: isLoading,
    save,
    saving,
    validationMessage,
    providerDetails,
    providerOptions: PROVIDER_OPTIONS,
  };
}
