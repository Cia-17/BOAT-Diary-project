"use client";

import { Card, CardContent } from "@/components/ui/card";
import { themes, type Theme } from "@/lib/themes";
import { useState, useEffect } from "react";

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<string>("golden");

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("journal-theme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      const theme = themes.find((t) => t.id === savedTheme);
      if (theme) {
        applyTheme(theme);
      }
    } else {
      // Apply default theme
      const defaultTheme = themes.find((t) => t.id === "golden");
      if (defaultTheme) {
        applyTheme(defaultTheme);
      }
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty("--theme-background", theme.background);
    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-secondary", theme.secondary);
    root.style.setProperty("--theme-accent", theme.accent);
    root.style.setProperty("--theme-text", theme.text);
    root.style.setProperty("--theme-card", theme.card);
    localStorage.setItem("journal-theme", theme.id);
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.id);
    applyTheme(theme);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Choose Your Theme</h3>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`relative overflow-hidden rounded-xl p-4 text-left transition-all transform hover:scale-105 ${
              selectedTheme === theme.id
                ? "ring-2 ring-gray-800 ring-offset-2"
                : ""
            }`}
            style={{
              background: theme.background,
              color: theme.text,
            }}
          >
            <div className="font-semibold text-sm">{theme.name}</div>
            {selectedTheme === theme.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

