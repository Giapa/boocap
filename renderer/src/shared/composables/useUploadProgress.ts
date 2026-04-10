import { ref, onMounted, onUnmounted } from "vue";

interface UploadProgress {
  current: number;
  total: number;
  chapterTitle: string;
  percent: number;
  estimatedInputTokens: number;
  savedCharacters: number;
}

export function useUploadProgress() {
  const progress = ref<UploadProgress | null>(null);
  let stopListening: (() => void) | null = null;

  onMounted(() => {
    stopListening = window.electronAPI.onUploadProgress((p) => {
      progress.value = p;
    });
  });

  onUnmounted(() => {
    stopListening?.();
    stopListening = null;
  });

  function reset() {
    progress.value = null;
  }

  return { progress, reset };
}
