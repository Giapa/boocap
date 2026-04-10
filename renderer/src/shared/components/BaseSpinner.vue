<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "Loading",
  },
);
</script>

<template>
  <div class="inline-flex items-center gap-3 text-sm text-slate-300" role="status" aria-live="polite">
    <span
class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-500/50 border-t-sky-300"
      aria-hidden="true" />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>
