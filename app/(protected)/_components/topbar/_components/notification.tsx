"use client";

import { useNotifications } from "@/lib/notifications/use-notifications";
import { NotificationPanel } from "./notification-panel";

export function NotificationDropdown() {
  const notifications = useNotifications();
  return <NotificationPanel {...notifications} />;
}
