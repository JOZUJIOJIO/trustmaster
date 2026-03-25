"use client";

import { useState, useEffect } from "react";

/**
 * Celestial Date Picker — three rotating rings (year/month/day)
 * Styled as golden mystical wheels with constellation decorations
 */

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);

// Chinese month names
const MONTH_CN: Record<number, string> = {
  1: "正月", 2: "二月", 3: "三月", 4: "四月", 5: "五月", 6: "六月",
  7: "七月", 8: "八月", 9: "九月", 10: "十月", 11: "冬月", 12: "腊月",
};

// Zodiac for visual decoration
const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function WheelColumn({
  items,
  value,
  onChange,
  renderItem,
  label,
}: {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  renderItem: (item: number, active: boolean) => React.ReactNode;
  label: string;
}) {
  const [scrolling, setScrolling] = useState(false);
  const containerRef = useState<HTMLDivElement | null>(null);

  const visibleCount = 5;
  const itemH = 40;
  const idx = items.indexOf(value);

  // Show items around current selection
  const getVisibleItems = () => {
    const result: { item: number; offset: number }[] = [];
    for (let i = -2; i <= 2; i++) {
      const itemIdx = idx + i;
      if (itemIdx >= 0 && itemIdx < items.length) {
        result.push({ item: items[itemIdx], offset: i });
      }
    }
    return result;
  };

  const visible = getVisibleItems();

  return (
    <div className="flex flex-col items-center">
      <div className="text-[9px] text-amber-400/30 tracking-widest mb-2 uppercase">{label}</div>
      <div className="relative" style={{ height: visibleCount * itemH, overflow: "hidden" }}>
        {/* Gradient masks */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#0a0814] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0814] to-transparent z-10 pointer-events-none" />

        {/* Selection highlight */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 border-y border-amber-400/20 bg-amber-400/[0.04] z-5" />

        {/* Items */}
        <div className="flex flex-col items-center">
          {visible.map(({ item, offset }) => {
            const isActive = offset === 0;
            const dist = Math.abs(offset);
            const opacity = isActive ? 1 : dist === 1 ? 0.4 : 0.15;
            const scale = isActive ? 1 : dist === 1 ? 0.85 : 0.7;

            return (
              <button
                key={item}
                onClick={() => onChange(item)}
                className="cursor-pointer transition-all duration-300 flex items-center justify-center"
                style={{
                  height: itemH,
                  width: "100%",
                  opacity,
                  transform: `scale(${scale})`,
                }}
              >
                {renderItem(item, isActive)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Up/Down arrows */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={() => {
            const i = items.indexOf(value);
            if (i > 0) onChange(items[i - 1]);
          }}
          className="text-amber-400/20 hover:text-amber-400/50 cursor-pointer transition-colors text-xs"
        >
          ▲
        </button>
        <button
          onClick={() => {
            const i = items.indexOf(value);
            if (i < items.length - 1) onChange(items[i + 1]);
          }}
          className="text-amber-400/20 hover:text-amber-400/50 cursor-pointer transition-colors text-xs"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export default function CelestialDatePicker({
  value,
  onChange,
}: {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}) {
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [initialized, setInitialized] = useState(false);

  // Parse initial value
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    }
    setInitialized(true);
  }, []);

  // Emit change
  useEffect(() => {
    if (!initialized) return;
    const maxDay = new Date(year, month, 0).getDate();
    const actualDay = Math.min(day, maxDay);
    if (actualDay !== day) setDay(actualDay);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(actualDay).padStart(2, "0")}`;
    onChange(dateStr);
  }, [year, month, day, initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxDay = new Date(year, month, 0).getDate();
  const validDays = DAYS.filter(d => d <= maxDay);

  return (
    <div className="flex flex-col items-center">
      {/* Decorative zodiac ring */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {ZODIAC_SYMBOLS.map((z, i) => (
          <span
            key={i}
            className="text-[10px] transition-all duration-300"
            style={{
              color: i === month - 1 ? "rgba(217,169,106,0.8)" : "rgba(217,169,106,0.12)",
              transform: i === month - 1 ? "scale(1.4)" : "scale(1)",
            }}
          >
            {z}
          </span>
        ))}
      </div>

      {/* Three columns */}
      <div className="flex items-center gap-2">
        {/* Year */}
        <WheelColumn
          items={YEARS}
          value={year}
          onChange={setYear}
          label="年"
          renderItem={(item, active) => (
            <span className={`text-base font-mono ${active ? "text-amber-300 font-bold" : "text-amber-200/50"}`}>
              {item}
            </span>
          )}
        />

        {/* Separator */}
        <div className="text-amber-400/15 text-lg self-center mt-4">·</div>

        {/* Month */}
        <WheelColumn
          items={MONTHS}
          value={month}
          onChange={setMonth}
          label="月"
          renderItem={(item, active) => (
            <div className="flex items-center gap-2">
              <span className={`text-base ${active ? "text-amber-300 font-bold" : "text-amber-200/50"}`}>
                {String(item).padStart(2, "0")}
              </span>
              <span className={`text-[10px] ${active ? "text-amber-400/60" : "text-amber-200/20"}`}>
                {MONTH_CN[item]}
              </span>
            </div>
          )}
        />

        <div className="text-amber-400/15 text-lg self-center mt-4">·</div>

        {/* Day */}
        <WheelColumn
          items={validDays}
          value={Math.min(day, maxDay)}
          onChange={setDay}
          label="日"
          renderItem={(item, active) => (
            <span className={`text-base font-mono ${active ? "text-amber-300 font-bold" : "text-amber-200/50"}`}>
              {String(item).padStart(2, "0")}
            </span>
          )}
        />
      </div>

      {/* Current selection display */}
      <div className="mt-4 text-center">
        <div className="text-amber-200/60 text-sm">
          {year}年 {MONTH_CN[month]} {String(day).padStart(2, "0")}日
        </div>
        <div className="text-amber-200/20 text-[10px] mt-1">
          公历 {year}-{String(month).padStart(2, "0")}-{String(day).padStart(2, "0")}
        </div>
      </div>

      {/* Fallback link */}
      <button
        onClick={() => {
          const el = document.createElement("input");
          el.type = "date";
          el.max = new Date().toISOString().split("T")[0];
          el.min = "1940-01-01";
          el.onchange = (e) => {
            const v = (e.target as HTMLInputElement).value;
            if (v) onChange(v);
          };
          el.click();
        }}
        className="mt-3 text-amber-200/15 text-[10px] hover:text-amber-200/30 cursor-pointer transition-colors"
      >
        使用系统日期选择器
      </button>
    </div>
  );
}
