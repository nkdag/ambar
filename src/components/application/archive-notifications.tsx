"use client";

import { useCallback, useState } from "react";
import { Notification, NotificationViewport } from "@/components/base/notification/notification";

type Notice = { id: string; title: string; description: string; status: "success" | "error" };

export function useArchiveNotifications() {
  const [toasts, setToasts] = useState<Notice[]>([]);
  const showToast = useCallback((input: Omit<Notice, "id">) => {
    setToasts((current) => [...current, { ...input, id: crypto.randomUUID() }].slice(-3));
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((notice) => notice.id !== id));
  }, []);
  return { toasts, showToast, dismissToast };
}

export function ArchiveNotifications({ toasts, onDismiss }: { toasts: Notice[]; onDismiss: (id: string) => void }) {
  return (
    <NotificationViewport className="archive-notifications">
      {toasts.map((notice) => <Notification key={notice.id} {...notice} autoDismissDuration={4200} onDismiss={() => onDismiss(notice.id)} />)}
    </NotificationViewport>
  );
}
