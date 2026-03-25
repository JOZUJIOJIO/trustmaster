"use client";

import { useLocale } from "@/lib/LocaleContext";

const categoryKeys = ["all", "tarot", "astrology", "fengshui", "palmistry", "numerology"];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({
  selected,
  onSelect,
}: CategoryFilterProps) {
  const { t } = useLocale();

  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
      {categoryKeys.map((key) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selected === key
              ? "bg-gradient-to-r from-amber-700 to-amber-600 text-white"
              : "bg-white/[0.05] text-amber-200/60 border border-amber-400/10 hover:border-amber-400/30"
          }`}
        >
          {t(`cat.${key}`)}
        </button>
      ))}
    </div>
  );
}
