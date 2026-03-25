"use client";

import { useLocale } from "@/lib/LocaleContext";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useLocale();

  return (
    <div className="px-4 pt-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/30 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] rounded-full text-sm text-amber-100 placeholder:text-amber-200/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white/[0.08] transition-colors border border-amber-400/10"
        />
      </div>
    </div>
  );
}
