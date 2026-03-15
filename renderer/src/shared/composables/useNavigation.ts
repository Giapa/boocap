import { ref, type Ref } from "vue";

export type AppView = "home" | "reading" | "settings";

interface NavigationState {
  view: Ref<AppView>;
  activeBookId: Ref<number | null>;
  openSettings: () => void;
  closeSettings: () => void;
  openBook: (bookId: number) => void;
  goHome: () => void;
}

export function useNavigation(): NavigationState {
  const view = ref<AppView>("home");
  const activeBookId = ref<number | null>(null);
  const previousView = ref<AppView>("home");

  function openSettings() {
    previousView.value = view.value;
    view.value = "settings";
  }

  function closeSettings() {
    view.value = previousView.value;
  }

  function openBook(bookId: number) {
    activeBookId.value = bookId;
    view.value = "reading";
  }

  function goHome() {
    view.value = "home";
    activeBookId.value = null;
  }

  return {
    view,
    activeBookId,
    openSettings,
    closeSettings,
    openBook,
    goHome,
  };
}
