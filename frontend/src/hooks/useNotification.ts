import { useState, useCallback } from "react";

export interface Notification {
  type: "success" | "error";
  message: string;
}

const NOTIFICATION_DURATION_MS = 4000;

/**
 * Hook for managing notifications/toasts
 * @param duration - How long to display notifications in ms
 * @returns Notification state and control functions
 */
export function useNotification(duration: number = NOTIFICATION_DURATION_MS) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setNotification({ type, message });
      const timer = window.setTimeout(() => setNotification(null), duration);
      return () => window.clearTimeout(timer);
    },
    [duration]
  );

  const clearNotification = useCallback(() => setNotification(null), []);

  return { notification, notify, clearNotification };
}
