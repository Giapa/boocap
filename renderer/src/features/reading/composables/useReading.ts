import { ref, watch } from "vue";
import { useAsyncState } from "@vueuse/core";
import type { Chapter } from "../../../../../shared/types";

export function useReading(bookId: number) {
  const activeIndex = ref(0);
  const summary = ref("");
  const summaryLoading = ref(false);

  const { state: chapters, isLoading: chaptersLoading } = useAsyncState(
    () => window.electronAPI.getChapters(bookId),
    [] as Chapter[],
  );

  async function loadSummary(index: number) {
    summaryLoading.value = true;
    try {
      const result = await window.electronAPI.getSummary(bookId, index);
      summary.value = result ?? "";
    } catch {
      summary.value = "Failed to load summary.";
    } finally {
      summaryLoading.value = false;
    }
  }

  watch(activeIndex, (index) => loadSummary(index), { immediate: true });

  function selectChapter(index: number) {
    activeIndex.value = index;
  }

  return { chapters, chaptersLoading, activeIndex, summary, summaryLoading, selectChapter };
}
