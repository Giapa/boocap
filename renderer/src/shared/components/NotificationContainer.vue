<script setup lang="ts">
import { computed } from "vue";
import type { NotificationType } from "../composables/useNotification";

interface Props {
  notifications: Array<{
    id: string;
    message: string;
    type: NotificationType;
  }>;
}

interface Emits {
  dismiss: [id: string];
}

defineProps<Props>();
defineEmits<Emits>();

function getColorClasses(type: NotificationType) {
  switch (type) {
    case "success":
      return "bg-green-900 text-green-100 border-green-700";
    case "error":
      return "bg-red-900 text-red-100 border-red-700";
    default:
      return "bg-blue-900 text-blue-100 border-blue-700";
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'px-4 py-3 rounded-lg border pointer-events-auto',
          'animate-in fade-in slide-in-from-top-2 duration-200',
          getColorClasses(notification.type),
        ]"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-medium">{{ notification.message }}</span>
          <button
            class="text-lg leading-none opacity-70 hover:opacity-100"
            @click="$emit('dismiss', notification.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.2s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
