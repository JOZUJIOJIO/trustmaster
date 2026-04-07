"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "cosmic" | "cloud";

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "cosmic",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("cosmic");

  useEffect(() => {
    const saved = localStorage.getItem("kairos-theme") as Theme | null;
    if (saved === "cloud" || saved === "cosmic") setTheme(saved);
  }, []);

  const toggle = () => {
    const next = theme === "cosmic" ? "cloud" : "cosmic";
    setTheme(next);
    localStorage.setItem("kairos-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
