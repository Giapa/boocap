import { ref, onMounted } from "vue";

interface UploadProgress {
  current: number;
  total: number;
  chapterTitle: string;
}

export function useUploadProgress() {
  const progress = ref<UploadProgress | null>(null);

  onMounted(() => {
    window.electronAPI.onUploadProgress((p) => {
      progress.value = p;
    });
  });

  function reset() {
    progress.value = null;
  }

  return { progress, reset };
}
