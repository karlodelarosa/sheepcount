"use client";

import { useTheme } from "@/context/theme-context";
import { useTenant } from "@/app/providers/tenant-provider";
import { WelcomeMessage } from "./_components/welcome-message";
import { UserDropdown } from "./_components/user-dropdown";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { NotificationDropdown } from "./_components/notification";

export function TopBar() {
  const { settings, toggleMode } = useTheme();
  const { tenant } = useTenant();

  if (!tenant) return null;

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
