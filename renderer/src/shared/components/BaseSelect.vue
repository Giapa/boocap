<script setup lang="ts">
defineProps<{
  modelValue: string;
  options: { value: string; label: string }[];
  label?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm text-gray-400">{{ label }}</label>
    <select
      :value="modelValue"
      class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
