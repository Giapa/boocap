<script setup lang="ts">
import BookView from "./features/book/BookView.vue";
import ReadingView from "./features/reading/ReadingView.vue";
import SettingsView from "./features/settings/SettingsView.vue";
import { useNavigation } from "./shared/composables/useNavigation";

const { view, activeBookId, openSettings, closeSettings, openBook, goHome } = useNavigation();
</script>

<template>
  <div class="h-screen bg-gray-900 text-white flex flex-col">
    <header class="flex items-center justify-between px-6 py-3 border-b border-gray-700 shrink-0">
      <button class="text-lg font-bold hover:text-indigo-400 transition-colors" @click="goHome">
        BooCap
      </button>
      <button class="text-gray-400 hover:text-white text-xl" @click="openSettings">
        &#9881;
      </button>
    </header>
    <div class="flex-1 overflow-hidden">
      <BookView v-if="view === 'home'" @book-selected="openBook" />
      <ReadingView v-else-if="view === 'reading' && activeBookId" :book-id="activeBookId" @back="goHome" />
      <SettingsView v-else-if="view === 'settings'" @back="closeSettings" />
    </div>
  </div>
</template>

<style>
@import "tailwindcss";
</style>
