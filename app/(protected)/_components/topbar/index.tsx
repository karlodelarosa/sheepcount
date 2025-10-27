"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button/index";

import { useTheme } from "@/context/theme-context";
import { useTenant } from "@/app/providers/tenant-provider";
import { WelcomeMessage } from "./_components/welcome-message";
import { UserDropdown } from "./_components/user-dropdown";

export function TopBar() {
  const { settings, toggleMode } = useTheme();
  const { tenant } = useTenant();

  if (!tenant) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        {tenant && <WelcomeMessage profile={tenant.profile} />}

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-muted"
            onClick={toggleMode}
          >
            {settings.mode === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-muted"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* User Dropdown */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 h-auto rounded-xl hover:bg-muted"
              >
                <Avatar className="w-9 h-9 border-2 border-border">
                  <AvatarFallback className="bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                <p className="text-foreground">qwe</p>
                <p className="text-muted-foreground">123</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border-border/60"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                <p className="text-foreground">qwe</p>
                <p className="text-muted-foreground">123</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 rounded-lg">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
