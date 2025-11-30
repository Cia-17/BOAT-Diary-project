"use client";

import { useEffect } from "react";
import { themes, getTheme } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem("journal-theme") || "golden";
    const theme = getTheme(savedTheme);
    
    const root = document.documentElement;
    root.style.setProperty("--theme-background", theme.background);
    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-secondary", theme.secondary);
    root.style.setProperty("--theme-accent", theme.accent);
    root.style.setProperty("--theme-text", theme.text);
    root.style.setProperty("--theme-card", theme.card);
  }, []);

  return <>{children}</>;
}

