<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    variant?: "primary" | "ghost";
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit";
    ariaLabel?: string;
  }>(),
  {
    variant: "primary",
    disabled: false,
    loading: false,
    type: "button",
    ariaLabel: undefined,
  },
);

defineEmits<{
  click: [];
}>();

const isDisabled = computed(() => props.disabled || props.loading);

const variantClasses = computed(() => {
  if (props.variant === "ghost") {
    return "border-white/12 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white";
  }

  return "border-sky-300/40 bg-sky-300 text-slate-950 hover:bg-sky-200";
});
</script>

<script setup lang="ts">
</script>

<template>
  <button
:type="type" :disabled="isDisabled" :aria-disabled="isDisabled" :aria-label="ariaLabel ?? label" :class="[
    'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    variantClasses,
    isDisabled && 'cursor-not-allowed opacity-60',
  ]" @click="$emit('click')">
    <span
v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-slate-500/40 border-t-slate-950"
      aria-hidden="true" />
    <span>{{ label }}</span>
  </button>
</template>
