"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeSettings {
  mode: 'light' | 'dark';
  accentColor: string;
  organizationName: string;
  organizationLogo: string | null;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (updates: Partial<ThemeSettings>) => void;
  toggleMode: () => void;
}

const defaultSettings: ThemeSettings = {
  mode: 'light',
  accentColor: '#030213',
  organizationName: 'OrgTrack',
  organizationLogo: null,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const stored = localStorage.getItem('theme-settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
    
    // Apply dark mode class
    if (settings.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply accent color as CSS variable
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  }, [settings]);

  const updateSettings = (updates: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleMode = () => {
    setSettings(prev => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
