<script setup lang="ts">
import BookView from "./features/book/BookView.vue";
import ReadingView from "./features/reading/ReadingView.vue";
import SettingsView from "./features/settings/SettingsView.vue";
import NotificationContainer from "./shared/components/NotificationContainer.vue";
import { useNavigation } from "./shared/composables/useNavigation";
import { useNotification } from "./shared/composables/useNotification";

const { view, activeBookId, openSettings, closeSettings, openBook, goHome } = useNavigation();
const { notifications, dismiss } = useNotification();
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div
aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_28%)]" />
    <div class="relative flex min-h-screen flex-col">
      <header class="shrink-0 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <nav aria-label="Primary navigation" class="flex items-center">
            <button
              class="rounded-2xl px-3 py-2 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              @click="goHome">
              <span class="block text-lg font-semibold tracking-tight text-white">BooCap</span>
              <span class="block text-[11px] uppercase tracking-[0.3em] text-slate-400">
                EPUB chapter briefs
              </span>
            </button>
          </nav>

          <button
            class="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            aria-label="Open settings" @click="openSettings">
            Settings
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-hidden">
        <BookView v-if="view === 'home'" @book-selected="openBook" />
        <ReadingView v-else-if="view === 'reading' && activeBookId" :book-id="activeBookId" @back="goHome" />
        <SettingsView v-else-if="view === 'settings'" @back="closeSettings" />
      </main>

      <NotificationContainer :notifications="notifications" @dismiss="dismiss" />
    </div>
  </div>
</template>

<style>
@import "tailwindcss";
</style>
