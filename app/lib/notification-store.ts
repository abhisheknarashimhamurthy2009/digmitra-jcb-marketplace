import {
  type AppNotification,
  INITIAL_NOTIFICATIONS,
  playNotificationSound,
} from "@/components/notifications/notification-center";

export function emitAppNotification(notification: Omit<AppNotification, "id" | "timestamp" | "read"> & { timestamp?: string }) {
  if (typeof window === "undefined") return;

  const fullNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: notification.timestamp || "Just now",
    read: false,
    ...notification,
  };

  window.dispatchEvent(
    new CustomEvent("digmitra:notification", {
      detail: fullNotif,
    })
  );

  playNotificationSound();
}
