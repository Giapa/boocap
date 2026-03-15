<script setup lang="ts">
import { useReading } from "./composables/useReading";
import BaseSpinner from "../../shared/components/BaseSpinner.vue";

const props = defineProps<{
  bookId: number;
}>();

defineEmits<{
  back: [];
}>();

const { chapters, chaptersLoading, activeIndex, summary, summaryLoading, selectChapter } =
  useReading(props.bookId);
</script>

<template>
  <div class="flex h-full">
    <aside class="w-72 shrink-0 border-r border-gray-700 overflow-y-auto p-4">
      <button class="text-sm text-gray-400 hover:text-white mb-4" @click="$emit('back')">
        &larr; Back
      </button>

      <BaseSpinner v-if="chaptersLoading" />

      <ul v-else class="flex flex-col gap-1">
        <li v-for="chapter in chapters" :key="chapter.position">
          <button :class="[
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            activeIndex === chapter.position
              ? 'bg-indigo-600 text-white'
              : 'text-gray-300 hover:bg-gray-800',
          ]" @click="selectChapter(chapter.position)">
            {{ chapter.title }}
          </button>
        </li>
      </ul>
    </aside>

    <main class="flex-1 overflow-y-auto p-8">
      <div v-if="summaryLoading" class="flex items-center gap-3">
        <BaseSpinner />
        <span class="text-sm text-gray-400">Loading summary...</span>
      </div>

      <div v-else-if="summary" class="prose prose-invert max-w-none">
        <h2 class="text-lg font-semibold text-white mb-4">
          {{ chapters[activeIndex]?.title }}
        </h2>
        <p class="text-gray-300 whitespace-pre-wrap leading-relaxed">{{ summary }}</p>
      </div>

      <p v-else class="text-gray-500">No summary available for this chapter.</p>
    </main>
  </div>
</template>
