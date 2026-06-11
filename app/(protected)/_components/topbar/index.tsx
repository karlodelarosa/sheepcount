"use client";

import { useEffect } from "react";
import { useTheme } from "@/context/theme-context";
import { useTenant } from "@/app/providers/tenant-provider";
import { WelcomeMessage } from "./_components/welcome-message";
import { UserDropdown } from "./_components/user-dropdown";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { NotificationDropdown } from "./_components/notification";
import { Skeleton } from "@/components/ui/skeleton";

export function TopBar() {
  const { settings, updateSettings } = useTheme();
  const { user, tenant, isLoading } = useTenant();

  useEffect(() => {
    if (tenant?.tenant.name && tenant.tenant.name !== settings.organizationName) {
      updateSettings({ organizationName: tenant.tenant.name });
    }
  }, [tenant, settings.organizationName, updateSettings]);

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md h-10 px-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </header>
    );
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md h-10">
      <div className="flex items-center justify-between px-4 h-full">
        <WelcomeMessage />

        <div className="flex items-center gap-1.5">
          {/* Dark Mode Toggle */}
          <ThemeSwitcher />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
