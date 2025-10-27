"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeSettings {
  mode: "light" | "dark" | "system";
  accentColor: string;
  organizationName: string;
  organizationLogo: string | null;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (updates: Partial<ThemeSettings>) => void;
  toggleMode: () => void;
  resolvedMode: "light" | "dark";
}

const defaultSettings: ThemeSettings = {
  mode: "system",
  accentColor: "#030213",
  organizationName: "OrgTrack",
  organizationLogo: null,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  // Load settings from localStorage on client
  useEffect(() => {
    const stored = localStorage.getItem("theme-settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  // Update DOM classes & variables when settings or resolved mode change
  useEffect(() => {
    if (!mounted) return;

    // Persist settings
    localStorage.setItem("theme-settings", JSON.stringify(settings));

    // Determine actual mode
    let mode: "light" | "dark" = "light";
    if (settings.mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      mode = prefersDark ? "dark" : "light";
    } else {
      mode = settings.mode;
    }
    setResolvedMode(mode);

    // Apply dark class
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply accent color
    document.documentElement.style.setProperty("--accent-color", settings.accentColor);
  }, [settings, mounted]);

  const updateSettings = (updates: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const toggleMode = () => {
    setSettings((prev) => {
      if (prev.mode === "light") return { ...prev, mode: "dark" };
      if (prev.mode === "dark") return { ...prev, mode: "light" };
      return { ...prev, mode: "system" };
    });
  };

  if (!mounted) return null; // prevent flash of wrong theme

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleMode, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
