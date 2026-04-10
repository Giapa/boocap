<script setup lang="ts">
import { computed, useId } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    placeholder?: string;
    type?: string;
    id?: string;
    helpText?: string;
    error?: string;
    autocomplete?: string;
    required?: boolean;
  }>(),
  {
    label: undefined,
    placeholder: undefined,
    type: "text",
    id: undefined,
    helpText: undefined,
    error: undefined,
    autocomplete: "off",
    required: false,
  },
);

defineEmits<{
  "update:modelValue": [value: string];
}>();

const generatedId = useId();

const inputId = computed(() => props.id ?? generatedId);
const helpId = computed(() => `${inputId.value}-help`);
const errorId = computed(() => `${inputId.value}-error`);
const describedBy = computed(() => {
  const ids = [];

  if (props.helpText) {
    ids.push(helpId.value);
  }

  if (props.error) {
    ids.push(errorId.value);
  }

  return ids.length > 0 ? ids.join(" ") : undefined;
});
</script>

<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-slate-200">
      {{ label }}
    </label>
    <input
:id="inputId" :value="modelValue" :placeholder="placeholder" :type="type" :autocomplete="autocomplete"
      :required="required" :aria-invalid="Boolean(error)" :aria-describedby="describedBy"
      class="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/20"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <p v-if="helpText" :id="helpId" class="text-xs text-slate-400">{{ helpText }}</p>
    <p v-if="error" :id="errorId" class="text-xs text-rose-300">{{ error }}</p>
  </div>
</template>
