import { ref, watch } from "vue";
import { useAsyncState } from "@vueuse/core";
import type { Chapter, CharacterFamilyTree } from "../../../../../shared/types";
import { getErrorMessage } from "../../../../../shared/utils/errors";
import { useNotification } from "../../../shared/composables/useNotification";

export function useReading(bookId: number) {
  const activeIndex = ref(0);
  const summary = ref("");
  const summaryLoading = ref(false);
  const summaryError = ref("");
  const characterQuery = ref("");
  const familyTree = ref<CharacterFamilyTree | null>(null);
  const familyTreeLoading = ref(false);
  const familyTreeError = ref("");
  const { show: showNotification } = useNotification();

  const { state: chapters, isLoading: chaptersLoading } = useAsyncState(
    () => window.electronAPI.getChapters(bookId),
    [] as Chapter[],
  );

  async function loadSummary(index: number) {
    if (!chapters.value.some((chapter) => chapter.position === index)) {
      summary.value = "";
      summaryError.value =
        chapters.value.length === 0 ? "" : "This chapter is no longer available.";
      return;
    }

    summaryLoading.value = true;
    summaryError.value = "";
    try {
      const result = await window.electronAPI.getSummary(bookId, index);
      summary.value = result ?? "";
    } catch (e) {
      const message = getErrorMessage(e, "Failed to load summary");
      summaryError.value = message;
      summary.value = "";
      showNotification(message, "error");
    } finally {
      summaryLoading.value = false;
    }
  }

  watch(
    chapters,
    (loadedChapters) => {
      if (loadedChapters.length === 0) {
        return;
      }

      if (!loadedChapters.some((chapter) => chapter.position === activeIndex.value)) {
        activeIndex.value = loadedChapters[0].position;
      }
    },
    { immediate: true },
  );

  watch(activeIndex, (index) => loadSummary(index), { immediate: true });

  function selectChapter(index: number) {
    if (!chapters.value.some((chapter) => chapter.position === index)) {
      return;
    }

    activeIndex.value = index;
  }

  async function searchFamilyTree() {
    const query = characterQuery.value.trim();

    if (query.length === 0) {
      familyTree.value = null;
      familyTreeError.value = "Enter a character name to search.";
      return;
    }

    familyTreeLoading.value = true;
    familyTreeError.value = "";

    try {
      const result = await window.electronAPI.searchCharacterFamilyTree(bookId, query);

      if (!result) {
        familyTree.value = null;
        familyTreeError.value = `No stored family tree was found for “${query}”.`;
        return;
      }

      familyTree.value = result;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to search the character database");
      familyTree.value = null;
      familyTreeError.value = message;
      showNotification(message, "error");
    } finally {
      familyTreeLoading.value = false;
    }
  }

  function clearFamilyTreeSearch() {
    characterQuery.value = "";
    familyTree.value = null;
    familyTreeError.value = "";
  }

  return {
    chapters,
    chaptersLoading,
    activeIndex,
    summary,
    summaryLoading,
    summaryError,
    characterQuery,
    familyTree,
    familyTreeLoading,
    familyTreeError,
    selectChapter,
    searchFamilyTree,
    clearFamilyTreeSearch,
  };
}
