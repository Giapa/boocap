<script setup lang="ts">
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
      return "border-emerald-400/30 bg-emerald-500/12 text-emerald-50";
    case "error":
      return "border-rose-400/30 bg-rose-500/12 text-rose-50";
    default:
      return "border-sky-400/30 bg-sky-500/12 text-sky-50";
  }
}

function getTypeLabel(type: NotificationType) {
  switch (type) {
    case "success":
      return "OK";
    case "error":
      return "!";
    default:
      return "i";
  }
}
</script>

<template>
  <div
class="pointer-events-none fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2" aria-live="polite"
    aria-relevant="additions text">
    <transition-group name="notification" tag="div">
      <div
v-for="notification in notifications" :key="notification.id" :class="[
        'pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg shadow-slate-950/30 backdrop-blur',
        getColorClasses(notification.type),
      ]" role="status">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <span
              class="rounded-full border border-current/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
              {{ getTypeLabel(notification.type) }}
            </span>
            <span class="text-sm font-medium leading-6">{{ notification.message }}</span>
          </div>
          <button
            class="text-lg leading-none opacity-70 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            aria-label="Dismiss notification" @click="$emit('dismiss', notification.id)">
            x
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
