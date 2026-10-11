"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeColor,
  ThemeMode,
  ThemeConfig,
  THEME_PALETTES,
  getThemeCssVariables,
} from "@/lib/theme";

interface ThemeContextType {
  color: ThemeColor;
  mode: ThemeMode;
  setColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  effectiveMode: "dark" | "light";
  switcherEnabled: boolean;
  availablePalettes: Record<string, ThemeConfig>;
}

const ThemeContext = createContext<ThemeContextType>({
  color: "purple",
  mode: "dark",
  setColor: () => {},
  setMode: () => {},
  effectiveMode: "dark",
  switcherEnabled: true,
  availablePalettes: THEME_PALETTES,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<ThemeColor>("purple");
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [effectiveMode, setEffectiveMode] = useState<"dark" | "light">("dark");
  const [switcherEnabled, setSwitcherEnabled] = useState(true);
  const [customPalettes, setCustomPalettes] = useState<Record<string, ThemeConfig>>({});

  useEffect(() => {
    // 1. Load saved preferences from localStorage
    const savedColor = localStorage.getItem("ahangam_theme_color");
    const savedMode = localStorage.getItem("ahangam_theme_mode") as ThemeMode;

    if (savedColor) {
      setColorState(savedColor);
    }
    if (savedMode && ["dark", "light", "system"].includes(savedMode)) {
      setModeState(savedMode);
    }

    // 2. Fetch server-configured settings (custom colors, default color, switcher switch)
    fetch("/api/settings/theme")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;

        if (typeof data.switcherEnabled === "boolean") {
          setSwitcherEnabled(data.switcherEnabled);
        }

        // Build custom palettes map
        if (Array.isArray(data.customThemes) && data.customThemes.length > 0) {
          const map: Record<string, ThemeConfig> = {};
          data.customThemes.forEach((t: ThemeConfig) => {
            if (t.id && t.primary) {
              map[t.id] = {
                id: t.id,
                name: t.name || t.id,
                nameFa: t.nameFa || t.name || t.id,
                primary: t.primary,
                primaryLight: t.primaryLight || t.primary,
                primaryDark: t.primaryDark || t.primary,
                accent: t.accent || t.primary,
                isCustom: true,
              };
            }
          });
          setCustomPalettes(map);
        }

        // If user hasn't explicitly customized color, use server default
        if (!savedColor && data.defaultColor) {
          setColorState(data.defaultColor);
        }
      })
      .catch(() => {});
  }, []);

  const allPalettes = { ...THEME_PALETTES, ...customPalettes };

  useEffect(() => {
    // Determine effective mode (light vs dark)
    let activeMode: "dark" | "light" = "dark";
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      activeMode = prefersDark ? "dark" : "light";
    } else {
      activeMode = mode;
    }
    setEffectiveMode(activeMode);

    // Apply CSS variables to root immediately
    const root = document.documentElement;
    root.setAttribute("data-theme-mode", activeMode);
    root.setAttribute("data-theme-color", color);
    if (activeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const vars = getThemeCssVariables(color, activeMode, customPalettes);
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [color, mode, customPalettes]);

  const setColor = (c: ThemeColor) => {
    setColorState(c);
    localStorage.setItem("ahangam_theme_color", c);
    document.cookie = `ahangam_theme_color=${c}; path=/; max-age=31536000`;
  };

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("ahangam_theme_mode", m);
    document.cookie = `ahangam_theme_mode=${m}; path=/; max-age=31536000`;
  };

  return (
    <ThemeContext.Provider
      value={{
        color,
        mode,
        setColor,
        setMode,
        effectiveMode,
        switcherEnabled,
        availablePalettes: allPalettes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
