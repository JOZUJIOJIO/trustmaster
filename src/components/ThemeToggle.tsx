"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="btn-haptic w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
      style={{
        background: theme === "cosmic"
          ? "rgba(242,240,235,0.06)"
          : "rgba(15,10,30,0.06)",
        border: `1px solid ${theme === "cosmic" ? "rgba(242,240,235,0.1)" : "rgba(15,10,30,0.1)"}`,
      }}
      title={theme === "cosmic" ? "Switch to Cloud theme" : "Switch to Cosmic theme"}
    >
      <span className="text-sm transition-transform duration-300" style={{ display: "inline-block", transform: theme === "cloud" ? "rotate(180deg)" : "rotate(0deg)" }}>
        {theme === "cosmic" ? "☁️" : "🌙"}
      </span>
    </button>
  );
}
