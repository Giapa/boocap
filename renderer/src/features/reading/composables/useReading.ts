import { ref, watch } from "vue";
import { useAsyncState } from "@vueuse/core";
import type { Chapter } from "../../../../../shared/types";
import { useNotification } from "../../../shared/composables/useNotification";

export function useReading(bookId: number) {
  const activeIndex = ref(0);
  const summary = ref("");
  const summaryLoading = ref(false);
  const summaryError = ref("");
  const { show: showNotification } = useNotification();

  const { state: chapters, isLoading: chaptersLoading } = useAsyncState(
    () => window.electronAPI.getChapters(bookId),
    [] as Chapter[],
  );

  async function loadSummary(index: number) {
    summaryLoading.value = true;
    summaryError.value = "";
    try {
      const result = await window.electronAPI.getSummary(bookId, index);
      summary.value = result ?? "";
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load summary";
      summaryError.value = message;
      summary.value = "";
      showNotification(message, "error");
    } finally {
      summaryLoading.value = false;
    }
  }

  watch(activeIndex, (index) => loadSummary(index), { immediate: true });

  function selectChapter(index: number) {
    activeIndex.value = index;
  }

  return { chapters, chaptersLoading, activeIndex, summary, summaryLoading, summaryError, selectChapter };
}
