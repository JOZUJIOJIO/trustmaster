"use client";

import { useState, useRef, useEffect } from "react";
import { locales } from "@/lib/i18n";
import { useLocale } from "@/lib/LocaleContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-[#F2F0EB]/[0.06] transition-colors border border-[#F2F0EB]/10 bg-[#F2F0EB]/[0.03]"
      >
        <span className="text-base">{current.flag}</span>
        <span className="hidden sm:inline text-[#F2F0EB]/50 text-xs font-medium">
          {current.label}
        </span>
        <svg
          className={`w-3 h-3 text-[#F2F0EB]/30 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#0c0a18] rounded-xl shadow-lg border border-[#F2F0EB]/[0.08] py-1 z-50 min-w-[140px]">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#F2F0EB]/[0.04] transition-colors ${
                locale === l.code ? "bg-[#F2F0EB]/[0.04] text-[#F2F0EB]/90 font-medium" : "text-[#F2F0EB]/50"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {locale === l.code && (
                <span className="ml-auto text-[#F2F0EB]/60 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
