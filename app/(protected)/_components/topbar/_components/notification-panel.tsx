"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  useNotifications,
  NotificationWithReadState,
} from "@/lib/notifications/use-notifications";
import type { NotificationTab } from "@/lib/notifications/types";

type NotificationPanelProps = Pick<
  ReturnType<typeof useNotifications>,
  | "hydrated"
  | "actionNotifications"
  | "upcomingNotifications"
  | "unreadByTab"
  | "totalUnread"
  | "markRead"
  | "markAllRead"
>;

function NotificationList({
  items,
  tab,
  onRead,
}: {
  items: NotificationWithReadState[];
  tab: NotificationTab;
  onRead: (id: string) => void;
}) {
  const Icon = tab === "actions" ? ClipboardList : CalendarDays;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-10 text-center">
        <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-foreground">
          {tab === "actions" ? "You're all caught up" : "Nothing coming up yet"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {tab === "actions"
            ? "New action items will appear here."
            : "Upcoming programs and events will appear here."}
        </p>
      </div>
    );
  }

  return (
    <ul className="max-h-[min(24rem,50dvh)] space-y-1 overflow-y-auto p-2">
      {items.map(notification => (
        <li key={notification.id}>
          <Link
            href={notification.href}
            onClick={() => onRead(notification.id)}
            className={cn(
              "group flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border/70 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-color)]",
              notification.unread && "bg-[var(--accent-color-soft)]",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-5 text-foreground">
                {notification.title}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {notification.message}
              </span>
            </span>
            {notification.unread && (
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent-color)]">
                <span className="sr-only">Unread</span>
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NotificationPanel({
  hydrated,
  actionNotifications,
  upcomingNotifications,
  unreadByTab,
  totalUnread,
  markRead,
  markAllRead,
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>("actions");
  const activeItems =
    activeTab === "actions" ? actionNotifications : upcomingNotifications;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-7 w-7 rounded-lg hover:bg-muted"
          aria-label={
            totalUnread > 0
              ? `${totalUnread} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="size-3.5 text-foreground" />
          {totalUnread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-[var(--accent-color)] px-0.5 text-[9px] font-semibold text-[var(--accent-color-foreground)]">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        collisionPadding={12}
        aria-label="Notifications"
        className="w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border-border/70 bg-card p-0 text-card-foreground shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Notifications
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalUnread > 0
                ? `${totalUnread} unread ${totalUnread === 1 ? "update" : "updates"}`
                : "You're up to date"}
            </p>
          </div>
          {hydrated && unreadByTab[activeTab] > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 text-xs text-[var(--accent-color-strong)] hover:bg-[var(--accent-color-soft)] hover:text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] dark:hover:text-[var(--accent-color)]"
              onClick={() => markAllRead(activeItems.map(item => item.id))}
            >
              <CheckCheck className="size-3.5" />
              Mark tab as read
            </Button>
          )}
        </div>
        {!hydrated ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" /> Loading notifications…
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as NotificationTab)}
            className="gap-0"
          >
            <div className="px-4">
              <TabsList aria-label="Notification categories">
                {(["actions", "upcoming"] as const).map(tab => {
                  const Icon = tab === "actions" ? ClipboardList : CalendarDays;
                  return (
                    <TabsTrigger key={tab} value={tab}>
                      <Icon className="size-4" />
                      {tab === "actions" ? "Actions" : "Upcoming"}
                      {unreadByTab[tab] > 0 && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">
                          {unreadByTab[tab]}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            {(["actions", "upcoming"] as const).map(tab => (
              <TabsContent key={tab} value={tab}>
                <NotificationList
                  tab={tab}
                  items={
                    tab === "actions"
                      ? actionNotifications
                      : upcomingNotifications
                  }
                  onRead={id => {
                    markRead(id);
                    setOpen(false);
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
        <div className="border-t border-border/60 p-2">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-between rounded-xl px-3 text-xs font-medium"
          >
            <Link
              href={
                activeTab === "actions"
                  ? "/growth-track?tab=actions"
                  : "/event-attendance"
              }
              onClick={() => setOpen(false)}
            >
              {activeTab === "actions" ? "View all actions" : "View all events"}
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
