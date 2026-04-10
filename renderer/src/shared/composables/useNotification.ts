import { ref, type Ref } from "vue";

export type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationState {
  notifications: Ref<Notification[]>;
  show: (message: string, type?: NotificationType, duration?: number) => void;
  dismiss: (id: string) => void;
}

let notificationId = 0;
const notifications = ref<Notification[]>([]);
const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 2200,
  error: 4500,
  info: 2800,
};

export function useNotification(): NotificationState {
  function show(
    message: string,
    type: NotificationType = "info",
    duration = DEFAULT_DURATIONS[type],
  ) {
    const id = `notification-${notificationId++}`;
    const notification: Notification = { id, message, type };

    notifications.value.push(notification);

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }

  function dismiss(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  return {
    notifications,
    show,
    dismiss,
  };
}
