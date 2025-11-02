"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import clsx from "clsx";

const THEME_SETTINGS_KEY = "theme-settings";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Load theme settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.mode) {
          setTheme(settings.mode);
        }
      }
    } catch (err) {
      console.error("Error loading theme settings:", err);
    }
    setMounted(true);
  }, [setTheme]);

  const handleThemeChange = (value: string) => {
    setTheme(value);

    try {
      // Get existing settings (or create new)
      const stored = localStorage.getItem(THEME_SETTINGS_KEY);
      const settings = stored ? JSON.parse(stored) : {};

      // Update mode only
      settings.mode = value;

      // Save back to localStorage
      localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error("Error saving theme settings:", err);
    }
  };

  if (!mounted) return null;

  const ICON_SIZE = 16;
  const items = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Laptop },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-xl">
          {theme === "light" ? (
            <Sun size={ICON_SIZE} className="text-muted-foreground" />
          ) : theme === "dark" ? (
            <Moon size={ICON_SIZE} className="text-muted-foreground" />
          ) : (
            <Laptop size={ICON_SIZE} className="text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border-border/60"
      >
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={handleThemeChange}
        >
          {items.map(({ key, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={key}
              value={key}
              className={clsx(
                "cursor-pointer rounded-lg flex items-center gap-2 px-2 py-2",
                theme === key && "bg-accent text-accent-foreground font-medium",
              )}
              style={{ paddingLeft: "0.5rem" }}
            >
              <Icon size={ICON_SIZE} className="text-muted-foreground" />
              <span>{label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
