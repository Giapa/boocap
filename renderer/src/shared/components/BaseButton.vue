<script setup lang="ts">
defineProps<{
  label: string;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      variant === 'ghost'
        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
        : 'bg-indigo-600 text-white hover:bg-indigo-500',
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
    ]"
    @click="$emit('click')"
  >
    <span v-if="loading" class="inline-block animate-spin mr-2">⟳</span>
    {{ label }}
  </button>
</template>
