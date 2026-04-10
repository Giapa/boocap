<script setup lang="ts">
import { computed } from "vue";
import { useReading } from "./composables/useReading";
import CharacterFamilyTree from "./components/CharacterFamilyTree.vue";
import BaseButton from "../../shared/components/BaseButton.vue";
import BaseSpinner from "../../shared/components/BaseSpinner.vue";

const props = defineProps<{
  bookId: number;
}>();

const emit = defineEmits<{
  back: [];
}>();

const {
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
} = useReading(props.bookId);

const activeChapter = computed(() =>
  chapters.value.find((chapter) => chapter.position === activeIndex.value) ?? null,
);

const currentChapterNumber = computed(() => {
  const index = chapters.value.findIndex((chapter) => chapter.position === activeIndex.value);
  return index >= 0 ? index + 1 : 0;
});

const previousChapterPosition = computed(() => {
  const index = chapters.value.findIndex((chapter) => chapter.position === activeIndex.value);
  return index > 0 ? chapters.value[index - 1].position : null;
});

const nextChapterPosition = computed(() => {
  const index = chapters.value.findIndex((chapter) => chapter.position === activeIndex.value);
  return index >= 0 && index < chapters.value.length - 1 ? chapters.value[index + 1].position : null;
});

function goToPreviousChapter() {
  if (previousChapterPosition.value !== null) {
    selectChapter(previousChapterPosition.value);
  }
}

function goToNextChapter() {
  if (nextChapterPosition.value !== null) {
    selectChapter(nextChapterPosition.value);
  }
}
</script>

<template>
  <div class="flex h-full flex-col xl:flex-row">
    <aside
      class="shrink-0 border-b border-white/10 bg-slate-950/55 xl:w-80 xl:border-b-0 xl:border-r xl:border-white/10">
      <div class="h-full overflow-y-auto p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <button
              class="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              @click="emit('back')">
              Back to library
            </button>
            <p class="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Chapter navigator
            </p>
            <h2 class="mt-2 text-xl font-semibold text-white">Browse cached summaries</h2>
            <p class="mt-2 text-sm text-slate-400">
              {{ chapters.length }} chapters available in this book.
            </p>
          </div>
          <span
v-if="activeChapter"
            class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            {{ currentChapterNumber }}/{{ chapters.length }}
          </span>
        </div>

        <div v-if="chaptersLoading" class="mt-8 flex items-center gap-3">
          <BaseSpinner label="Loading chapters" />
          <p class="text-sm text-slate-400">Loading chapter list…</p>
        </div>

        <nav v-else class="mt-8" aria-label="Chapter list">
          <ul class="flex flex-col gap-2">
            <li v-for="chapter in chapters" :key="chapter.position">
              <button
:aria-current="activeIndex === chapter.position ? 'page' : undefined" :class="[
                'w-full rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300',
                activeIndex === chapter.position
                  ? 'border-sky-300/30 bg-sky-300/12 text-white'
                  : 'border-white/8 bg-white/5 text-slate-300 hover:bg-white/8 hover:text-white',
              ]" @click="selectChapter(chapter.position)">
                {{ chapter.title }}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <section
          class="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {{ activeChapter ? `Chapter ${currentChapterNumber} of ${chapters.length}` : 'Summary' }}
              </p>
              <h1 class="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {{ activeChapter?.title ?? 'Select a chapter' }}
              </h1>
            </div>

            <div class="flex flex-wrap gap-2">
              <BaseButton
label="Previous" variant="ghost" :disabled="previousChapterPosition === null"
                @click="goToPreviousChapter" />
              <BaseButton
label="Next" variant="ghost" :disabled="nextChapterPosition === null"
                @click="goToNextChapter" />
            </div>
          </div>

          <div class="mt-8 min-h-[20rem]">
            <div v-if="summaryLoading" class="flex items-center gap-3">
              <BaseSpinner label="Loading summary" />
              <span class="text-sm text-slate-400">Loading summary…</span>
            </div>

            <div v-else-if="summary" class="space-y-6">
              <p class="text-sm leading-6 text-slate-400">
                Readable, chapter-by-chapter notes cached locally after the first generation.
              </p>
              <article class="max-w-none">
                <p class="whitespace-pre-wrap text-base leading-8 text-slate-100">{{ summary }}</p>
              </article>
            </div>

            <div
v-else-if="summaryError"
              class="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {{ summaryError }}
            </div>

            <p v-else class="text-sm text-slate-500">No summary is stored for this chapter yet.</p>
          </div>
        </section>

        <CharacterFamilyTree
:query="characterQuery" :tree="familyTree" :loading="familyTreeLoading"
          :error="familyTreeError" @update:query="characterQuery = $event" @search="searchFamilyTree"
          @clear="clearFamilyTreeSearch" />
      </div>
    </main>
  </div>
</template>
