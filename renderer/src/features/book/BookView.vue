<script setup lang="ts">
import { computed } from "vue";
import { useBooks } from "./composables/useBooks";
import { useUploadProgress } from "../../shared/composables/useUploadProgress";
import BaseButton from "../../shared/components/BaseButton.vue";
import BaseSpinner from "../../shared/components/BaseSpinner.vue";

const emit = defineEmits<{
  bookSelected: [bookId: number];
}>();

const { books, loading, uploading, uploadError, openAndUpload } = useBooks();
const { progress, reset } = useUploadProgress();

const progressPercent = computed(() => progress.value?.percent ?? 0);

const progressSummary = computed(() => {
  if (!progress.value) {
    return "Preparing your EPUB for summarization.";
  }

  return `About ${progress.value.estimatedInputTokens.toLocaleString()} input tokens for this chapter after trimming ${progress.value.savedCharacters.toLocaleString()} characters.`;
});

async function handleUpload() {
  reset();
  const result = await openAndUpload();
  if (result) {
    emit("bookSelected", result.book.id);
  }
}
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:justify-center">
    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <div class="rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/80">
          Local-first reader workflow
        </p>
        <h1 class="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Summarize the parts of a book that matter, without the clutter.
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          BooCap filters noisy EPUB content, keeps summaries cached locally, and shows progress chapter by chapter while
          your provider does the work.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <BaseButton :loading="uploading" label="Upload EPUB" @click="handleUpload" />
          <p class="text-sm text-slate-400">EPUB only. Books stay on this device.</p>
        </div>

        <div
v-if="uploadError"
          class="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {{ uploadError }}
        </div>
      </div>

      <aside
        class="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Upload status
            </p>
            <h2 class="mt-2 text-xl font-semibold text-white">
              {{ uploading ? 'Summarization in progress' : 'Ready when you are' }}
            </h2>
          </div>
          <span class="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            {{ books.length }} {{ books.length === 1 ? 'book' : 'books' }}
          </span>
        </div>

        <div v-if="loading" class="mt-8 flex items-center gap-3">
          <BaseSpinner label="Loading library" />
          <p class="text-sm text-slate-400">Loading your library…</p>
        </div>

        <template v-else>
          <div v-if="uploading" class="mt-8 space-y-5">
            <div class="flex items-center gap-3">
              <BaseSpinner label="Summarizing book" />
              <p class="text-sm text-slate-300">
                {{ progress ? `Chapter ${progress.current} of ${progress.total}` : 'Parsing EPUB structure' }}
              </p>
            </div>

            <div class="space-y-3 rounded-2xl border border-white/8 bg-white/5 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-white">
                  {{ progress?.chapterTitle ?? 'Preparing chapters' }}
                </p>
                <span class="text-xs font-medium text-slate-400">{{ progressPercent }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-sky-300 to-teal-300 transition-[width] duration-300"
                  :style="{ width: `${progressPercent}%` }" />
              </div>
              <p class="text-sm leading-6 text-slate-300">{{ progressSummary }}</p>
            </div>
          </div>

          <div v-else class="mt-8 space-y-4 text-sm text-slate-300">
            <div class="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p class="font-medium text-white">Balanced token use</p>
              <p class="mt-2 leading-6 text-slate-400">
                Chapters are normalized, duplicate content is skipped, and long inputs are cut on cleaner boundaries
                before they reach a model.
              </p>
            </div>
            <div class="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p class="font-medium text-white">Readable progress</p>
              <p class="mt-2 leading-6 text-slate-400">
                Every upload shows which chapter is running and how much text was trimmed before the request is sent.
              </p>
            </div>
          </div>
        </template>
      </aside>
    </section>

    <section
v-if="books.length > 0"
      class="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-xl shadow-slate-950/20 backdrop-blur">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Library</p>
          <h3 class="mt-2 text-xl font-semibold text-white">Pick up where you left off</h3>
        </div>
        <p class="text-sm text-slate-400">Select a title to browse chapter summaries.</p>
      </div>

      <ul class="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <li v-for="book in books" :key="book.id">
          <button
            class="w-full rounded-2xl border border-white/8 bg-slate-950/65 px-4 py-4 text-left text-white transition hover:border-sky-300/30 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            @click="$emit('bookSelected', book.id)">
            <span class="block text-sm font-medium text-white">{{ book.title }}</span>
            <span class="mt-2 block text-xs uppercase tracking-[0.25em] text-slate-500">
              Open summaries
            </span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
