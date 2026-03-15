import { ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import type { Book, BookWithChapters } from "../../../../../shared/types";
import { useNotification } from "../../../shared/composables/useNotification";

export function useBooks() {
  const uploading = ref(false);
  const uploadError = ref("");
  const { show: showNotification } = useNotification();

  const {
    state: books,
    isLoading,
    execute: refresh,
  } = useAsyncState(() => window.electronAPI.getBooks(), [] as Book[]);

  async function openAndUpload(): Promise<BookWithChapters | null> {
    const filePath = await window.electronAPI.openFileDialog();
    if (!filePath) return null;

    uploading.value = true;
    uploadError.value = "";

    try {
      const result = await window.electronAPI.uploadBook(filePath);
      await refresh();
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to upload book";
      uploadError.value = message;
      showNotification(message, "error");
      return null;
    } finally {
      uploading.value = false;
    }
  }

  return { books, loading: isLoading, uploading, uploadError, openAndUpload, refresh };
}
