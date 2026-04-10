<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { useSettings } from "./composables/useSettings";
import BaseSelect from "../../shared/components/BaseSelect.vue";
import BaseInput from "../../shared/components/BaseInput.vue";
import BaseButton from "../../shared/components/BaseButton.vue";
import BaseSpinner from "../../shared/components/BaseSpinner.vue";

const emit = defineEmits<{ back: [] }>();

useEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    emit("back");
  }
});

const { provider, apiKey, loading, save, saving, validationMessage, providerDetails, providerOptions } =
  useSettings();
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-5xl items-start px-6 py-10">
    <section
      class="w-full rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Provider setup</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight text-white">Settings</h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Configure the provider that generates summaries. Keys are stored locally in the app and are required before
            an upload can start.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span class="hidden text-xs uppercase tracking-[0.3em] text-slate-500 sm:inline">Esc closes this view</span>
          <BaseButton label="Back" variant="ghost" @click="emit('back')" />
        </div>
      </div>

      <div v-if="loading" class="mt-10 flex items-center gap-3">
        <BaseSpinner label="Loading settings" />
        <p class="text-sm text-slate-400">Loading saved settings…</p>
      </div>

      <div v-else class="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
        <div class="space-y-5">
          <BaseSelect
v-model="provider" :options="providerOptions" label="LLM Provider"
            :help-text="providerDetails.helpText" />
          <BaseInput
v-model="apiKey" label="API Key" placeholder="Paste your API key" type="password"
            autocomplete="off" :help-text="providerDetails.keyHint" :error="validationMessage || undefined" />

          <div class="flex flex-wrap items-center gap-3">
            <BaseButton :loading="saving" label="Save settings" @click="save" />
            <p class="text-sm text-slate-400">Trimmed and stored locally on save.</p>
          </div>
        </div>

        <aside class="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Selected provider</p>
          <h3 class="mt-3 text-xl font-semibold text-white">{{ providerDetails.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-slate-300">{{ providerDetails.description }}</p>

          <div class="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4">
            <p class="text-sm font-medium text-white">What to expect</p>
            <p class="mt-2 text-sm leading-6 text-slate-400">{{ providerDetails.helpText }}</p>
          </div>

          <div class="mt-4 rounded-2xl border border-sky-300/15 bg-sky-400/8 p-4 text-sm leading-6 text-sky-50/90">
            Summaries only start after your provider key is configured. If the key is missing, the upload flow stops
            before parsing or API calls begin.
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
