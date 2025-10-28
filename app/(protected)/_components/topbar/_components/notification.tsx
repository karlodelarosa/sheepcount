"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown/index";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New announcement posted!",
      unread: true,
    },
    {
      id: 2,
      message: "Team meeting scheduled tomorrow.",
      unread: true,
    },
    {
      id: 3,
      message: "Welcome to our new members 👋",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-muted"
        >
          <Bell className="w-5 h-5 text-foreground" />

          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifications
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-500 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {notifications.length === 0 && (
          <DropdownMenuItem disabled className="text-sm text-muted-foreground">
            No notifications
          </DropdownMenuItem>
        )}

        {notifications.map(notification => (
          <DropdownMenuItem
            key={notification.id}
            className="flex gap-2 items-center cursor-pointer"
          >
            {notification.unread && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
            <span className="text-sm">{notification.message}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="justify-center text-sm text-blue-600 cursor-pointer">
          View all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { NotificationDropdown };
