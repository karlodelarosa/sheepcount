"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  type NotificationWithReadState,
} from "@/lib/notifications/use-notifications";
import type { NotificationTab } from "@/lib/notifications/types";

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: NotificationWithReadState;
  onRead: (id: string) => void;
}) {
  return (
    <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
      <Link
        href={notification.href}
        onClick={() => onRead(notification.id)}
        className={cn(
          "flex gap-2.5 items-start w-full px-2 py-2 rounded-md cursor-pointer hover:bg-muted/80 transition-colors",
          notification.unread && "bg-blue-50/60 dark:bg-blue-950/20",
        )}
      >
        {notification.unread ? (
          <span className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full shrink-0" />
        ) : (
          <span className="w-2 h-2 mt-1.5 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-tight">
            {notification.title}
          </span>
          <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
            {notification.message}
          </span>
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function NotificationList({
  items,
  emptyMessage,
  onRead,
}: {
  items: NotificationWithReadState[];
  emptyMessage: string;
  onRead: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="max-h-72 overflow-y-auto space-y-0.5 px-1 py-1">
      {items.map(notification => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onRead={onRead}
        />
      ))}
    </div>
  );
}

const NotificationDropdown = () => {
  const [activeTab, setActiveTab] = useState<NotificationTab>("actions");
  const {
    hydrated,
    actionNotifications,
    upcomingNotifications,
    unreadByTab,
    totalUnread,
    markRead,
    markAllRead,
  } = useNotifications();

  const activeItems =
    activeTab === "actions" ? actionNotifications : upcomingNotifications;
  const activeUnread = unreadByTab[activeTab];

  const handleMarkAllRead = () => {
    markAllRead(activeItems.map(item => item.id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
          <Bell className="w-3.5 h-3.5 text-foreground" />
          <NotificationBadge count={totalUnread} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="flex justify-between items-center px-3 py-2">
          <span>Notifications</span>
          {activeUnread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-blue-500 hover:underline font-normal"
            >
              Mark tab as read
            </button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="m-0" />

        {!hydrated ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as NotificationTab)}
            className="gap-0"
          >
            <div className="px-3 pt-2 pb-1">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="actions" className="text-xs gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Actions
                  {unreadByTab.actions > 0 && (
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      {unreadByTab.actions}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="text-xs gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Upcoming
                  {unreadByTab.upcoming > 0 && (
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      {unreadByTab.upcoming}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="actions" className="mt-0">
              <NotificationList
                items={actionNotifications}
                emptyMessage="No action items right now."
                onRead={markRead}
              />
            </TabsContent>

            <TabsContent value="upcoming" className="mt-0">
              <NotificationList
                items={upcomingNotifications}
                emptyMessage="No upcoming programs or events."
                onRead={markRead}
              />
            </TabsContent>
          </Tabs>
        )}

        <DropdownMenuSeparator className="m-0" />

        <DropdownMenuItem asChild className="justify-center text-sm text-blue-600 cursor-pointer py-2">
          <Link href={activeTab === "actions" ? "/growth-track?tab=actions" : "/event-attendance"}>
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { NotificationDropdown };
