<script setup lang="ts">
import { useBooks } from "./composables/useBooks";
import { useUploadProgress } from "../../shared/composables/useUploadProgress";
import BaseButton from "../../shared/components/BaseButton.vue";
import BaseSpinner from "../../shared/components/BaseSpinner.vue";

const emit = defineEmits<{
  bookSelected: [bookId: number];
}>();

const { books, loading, uploading, uploadError, openAndUpload } = useBooks();
const { progress, reset } = useUploadProgress();

async function handleUpload() {
  reset();
  const result = await openAndUpload();
  if (result) {
    emit("bookSelected", result.book.id);
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-6">
    <h1 class="text-3xl font-bold text-white">BooCap</h1>

    <BaseSpinner v-if="loading" />

    <template v-else>
      <div v-if="uploading" class="flex flex-col items-center gap-3">
        <BaseSpinner />
        <p v-if="progress" class="text-sm text-gray-400">
          Summarizing chapter {{ progress.current }}/{{ progress.total }}:
          {{ progress.chapterTitle }}
        </p>
        <p v-else class="text-sm text-gray-400">Parsing book...</p>
      </div>

      <BaseButton v-else label="Upload EPUB" @click="handleUpload" />

      <p v-if="uploadError" class="text-sm text-red-400 max-w-md text-center">
        {{ uploadError }}
      </p>

      <div v-if="books.length > 0" class="mt-8 w-full max-w-md">
        <h3 class="text-sm text-gray-400 mb-3">Your books</h3>
        <ul class="flex flex-col gap-2">
          <li v-for="book in books" :key="book.id">
            <button
              class="w-full text-left px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              @click="$emit('bookSelected', book.id)">
              {{ book.title }}
            </button>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
