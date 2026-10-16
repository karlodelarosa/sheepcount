"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import { useTheme as useWorkspaceTheme } from "@/context/theme-context";

export function MobileThemeToggle() {
  const { setTheme } = useNextTheme();
  const { settings, resolvedMode, updateSettings } = useWorkspaceTheme();
  const nextMode = resolvedMode === "dark" ? "light" : "dark";
  const label = `Use ${nextMode} appearance`;

  useEffect(() => {
    setTheme(settings.mode);
  }, [setTheme, settings.mode]);

  const toggle = () => {
    updateSettings({ mode: nextMode });
    setTheme(nextMode);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted active:bg-muted motion-reduce:transition-none"
    >
      {resolvedMode === "dark" ? (
        <Sun className="size-5" strokeWidth={1.9} />
      ) : (
        <Moon className="size-5" strokeWidth={1.9} />
      )}
    </button>
  );
}
