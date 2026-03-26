"use client";

import { useState } from "react";
import { CHINESE_HOURS } from "@/lib/bazi";

/**
 * Mystical Chinese Hour Dial — clock-face SVG
 * 12 segments at 30° each, click to select
 */
export default function ChineseHourDial({
  value,
  onChange,
  isChinese,
}: {
  value: string;
  onChange: (branch: string) => void;
  isChinese: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = 160, cy = 160, outerR = 140, innerR = 70;

  // Animal emojis for each branch
  const ANIMAL_EMOJI: Record<string, string> = {
    子: "🐀", 丑: "🐂", 寅: "🐅", 卯: "🐇", 辰: "🐉", 巳: "🐍",
    午: "🐴", 未: "🐏", 申: "🐒", 酉: "🐓", 戌: "🐕", 亥: "🐖",
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 320 320" className="overflow-visible w-full max-w-[280px]">
        <defs>
          <filter id="hourGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(217,169,106,0.08)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(217,169,106,0.06)" strokeWidth="0.5" />

        {/* Background glow */}
        <circle cx={cx} cy={cy} r={outerR - 10} fill="rgba(217,169,106,0.02)" />

        {/* 12 segments */}
        {CHINESE_HOURS.map((h, i) => {
          const startAngle = (i * 30 - 90) * (Math.PI / 180);
          const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const midAngle = ((i * 30 + 15) - 90) * (Math.PI / 180);
          const isSelected = value === h.branch;
          const isHovered = hovered === h.branch;
          const active = isSelected || isHovered;

          // Arc path for segment
          const x1 = cx + innerR * Math.cos(startAngle);
          const y1 = cy + innerR * Math.sin(startAngle);
          const x2 = cx + outerR * Math.cos(startAngle);
          const y2 = cy + outerR * Math.sin(startAngle);
          const x3 = cx + outerR * Math.cos(endAngle);
          const y3 = cy + outerR * Math.sin(endAngle);
          const x4 = cx + innerR * Math.cos(endAngle);
          const y4 = cy + innerR * Math.sin(endAngle);

          const path = `M${x1},${y1} L${x2},${y2} A${outerR},${outerR} 0 0,1 ${x3},${y3} L${x4},${y4} A${innerR},${innerR} 0 0,0 ${x1},${y1} Z`;

          // Label positions
          const labelR = (outerR + innerR) / 2;
          const labelX = cx + labelR * Math.cos(midAngle);
          const labelY = cy + labelR * Math.sin(midAngle);

          // Emoji position (outer)
          const emojiR = outerR + 16;
          const emojiX = cx + emojiR * Math.cos(midAngle);
          const emojiY = cy + emojiR * Math.sin(midAngle);

          return (
            <g
              key={h.branch}
              className="cursor-pointer"
              onClick={() => onChange(h.branch)}
              onMouseEnter={() => setHovered(h.branch)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Segment */}
              <path
                d={path}
                fill={isSelected ? "rgba(217,169,106,0.15)" : active ? "rgba(217,169,106,0.08)" : "rgba(255,255,255,0.01)"}
                stroke={isSelected ? "rgba(217,169,106,0.4)" : "rgba(217,169,106,0.06)"}
                strokeWidth={isSelected ? 1.5 : 0.5}
                filter={isSelected ? "url(#hourGlow)" : ""}
                style={{ transition: "all 0.3s ease" }}
              />

              {/* Hour name */}
              <text
                x={labelX}
                y={labelY - 5}
                textAnchor="middle"
                dominantBaseline="central"
                fill={active ? "rgba(217,169,106,0.9)" : "rgba(217,169,106,0.4)"}
                fontSize={active ? "11" : "10"}
                fontWeight={active ? "bold" : "normal"}
                style={{ transition: "all 0.3s ease" }}
              >
                {isChinese ? h.name : h.nameEn}
              </text>

              {/* Time range */}
              <text
                x={labelX}
                y={labelY + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(217,169,106,0.2)"
                fontSize="7"
              >
                {h.label}
              </text>

              {/* Animal emoji outside */}
              <text
                x={emojiX}
                y={emojiY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={active ? "14" : "10"}
                opacity={active ? 1 : 0.3}
                style={{ transition: "all 0.3s ease" }}
              >
                {ANIMAL_EMOJI[h.branch]}
              </text>

              {/* Selection pulse ring */}
              {isSelected && (
                <circle cx={labelX} cy={labelY} r="18" fill="none" stroke="rgba(217,169,106,0.2)" strokeWidth="1">
                  <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* Center Taiji */}
        <circle cx={cx} cy={cy} r="28" fill="rgba(10,8,20,0.9)" stroke="rgba(217,169,106,0.15)" strokeWidth="1" />
        {value ? (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" fill="rgba(217,169,106,0.8)" fontSize="14" fontWeight="bold">
              {CHINESE_HOURS.find(h => h.branch === value)?.name || ""}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(217,169,106,0.3)" fontSize="8">
              {value}
            </text>
          </>
        ) : (
          <text x={cx} y={cy + 3} textAnchor="middle" fill="rgba(217,169,106,0.2)" fontSize="9">
            选择时辰
          </text>
        )}
      </svg>
    </div>
  );
}
