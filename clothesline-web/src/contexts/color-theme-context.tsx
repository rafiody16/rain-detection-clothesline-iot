"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export const AVAILABLE_THEMES = [
  {
    id: "default",
    label: "Default",
    colorClass: "bg-slate-900 border border-slate-200 dark:bg-slate-50 dark:border-slate-800"
  },
  {
    id: "bubblegum",
    label: "Bubblegum",
    colorClass: "bg-pink-500"
  },
  {
    id: "soft-pop",
    label: "Soft Pop",
    colorClass: "bg-indigo-400"
  },
  {
    id: "nature",
    label: "Nature",
    colorClass: "bg-green-500"
  },
  {
    id: "ocean-breeze",
    label: "Ocean Breeze",
    colorClass: "bg-blue-500"
  },
  {
    id: "neo-brutal",
    label: "Neo Brutal",
    colorClass: "bg-gray-900"
  }
] as const;

export type ColorTheme = typeof AVAILABLE_THEMES[number]["id"];

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("color-theme") as ColorTheme;
      return saved || "default";
    }
    return "default";
  });

  useEffect(() => {
    if (colorTheme !== "default") {
      document.documentElement.setAttribute("data-theme", colorTheme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("color-theme", colorTheme);
  }, [colorTheme]);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem("color-theme", theme);
    
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
