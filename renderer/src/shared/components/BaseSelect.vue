<script setup lang="ts">
import { computed, useId } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: { value: string; label: string }[];
    label?: string;
    id?: string;
    helpText?: string;
  }>(),
  {
    label: undefined,
    id: undefined,
    helpText: undefined,
  },
);

defineEmits<{
  "update:modelValue": [value: string];
}>();

const generatedId = useId();
const selectId = computed(() => props.id ?? generatedId);
const helpId = computed(() => `${selectId.value}-help`);
</script>

<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-slate-200">
      {{ label }}
    </label>
    <select
:id="selectId" :value="modelValue" :aria-describedby="helpText ? helpId : undefined"
      class="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/20"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="helpText" :id="helpId" class="text-xs text-slate-400">{{ helpText }}</p>
  </div>
</template>
