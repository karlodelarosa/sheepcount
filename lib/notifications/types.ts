export type NotificationTab = "actions" | "upcoming";

export type AppNotification = {
  id: string;
  tab: NotificationTab;
  title: string;
  message: string;
  href: string;
  sortKey: string;
};
