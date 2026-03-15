<script setup lang="ts">
defineProps<{
  modelValue: string;
  label?: string;
  placeholder?: string;
  type?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm text-gray-400">{{ label }}</label>
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :type="type ?? 'text'"
      class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
