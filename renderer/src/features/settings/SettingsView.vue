<script setup lang="ts">
import { useSettings } from "./composables/useSettings";
import { useNotification } from "../../shared/composables/useNotification";
import BaseSelect from "../../shared/components/BaseSelect.vue";
import BaseInput from "../../shared/components/BaseInput.vue";
import BaseButton from "../../shared/components/BaseButton.vue";
import BaseSpinner from "../../shared/components/BaseSpinner.vue";
import NotificationContainer from "../../shared/components/NotificationContainer.vue";

defineEmits<{ back: [] }>();

const { provider, apiKey, loading, save, providerOptions } = useSettings();
const { notifications, dismiss } = useNotification();
</script>

<template>
  <div class="max-w-md mx-auto mt-16 flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-white">Settings</h2>
      <BaseButton label="Back" variant="ghost" @click="$emit('back')" />
    </div>

    <BaseSpinner v-if="loading" />

    <template v-else>
      <BaseSelect v-model="provider" :options="providerOptions" label="LLM Provider" />
      <BaseInput v-model="apiKey" label="API Key" placeholder="Enter your API key" type="password" />
      <BaseButton label="Save" @click="save" />
    </template>
  </div>

  <NotificationContainer :notifications="notifications" @dismiss="dismiss" />
</template>
