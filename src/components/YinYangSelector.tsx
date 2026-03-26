"use client";

import { useState } from "react";

/**
 * Yin/Yang gender selector — interactive split circle
 */
export default function YinYangSelector({
  value,
  onChange,
  isChinese,
}: {
  value: "male" | "female" | "";
  onChange: (gender: "male" | "female") => void;
  isChinese: boolean;
}) {
  const [hovered, setHovered] = useState<"male" | "female" | null>(null);
  const size = 240;
  const cx = size / 2, cy = size / 2, r = 100;

  const maleActive = value === "male" || hovered === "male";
  const femaleActive = value === "female" || hovered === "female";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="overflow-visible w-full max-w-[240px]">
        <defs>
          <filter id="yinGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="yangGrad">
            <stop offset="0%" stopColor="rgba(217,169,106,0.2)" />
            <stop offset="100%" stopColor="rgba(217,169,106,0.05)" />
          </radialGradient>
          <radialGradient id="yinGrad">
            <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.05)" />
          </radialGradient>
        </defs>

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="rgba(217,169,106,0.08)" strokeWidth="0.5" />

        {/* Yang (male) — right half */}
        <g
          className="cursor-pointer"
          onClick={() => onChange("male")}
          onMouseEnter={() => setHovered("male")}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Half circle path — right */}
          <path
            d={`M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} A${r/2} ${r/2} 0 0 0 ${cx} ${cy} A${r/2} ${r/2} 0 0 1 ${cx} ${cy - r}`}
            fill={maleActive ? "url(#yangGrad)" : "rgba(217,169,106,0.03)"}
            stroke={maleActive ? "rgba(217,169,106,0.3)" : "rgba(217,169,106,0.06)"}
            strokeWidth={value === "male" ? 2 : 0.5}
            filter={value === "male" ? "url(#yinGlow)" : ""}
            style={{ transition: "all 0.5s ease" }}
          />
          {/* Sun icon */}
          <text x={cx + 35} y={cy - 15} textAnchor="middle" fontSize="28"
            opacity={maleActive ? 1 : 0.3} style={{ transition: "opacity 0.3s" }}>
            ☀
          </text>
          {/* Label */}
          <text x={cx + 35} y={cy + 15} textAnchor="middle"
            fill={maleActive ? "rgba(217,169,106,0.9)" : "rgba(217,169,106,0.3)"}
            fontSize="13" fontWeight={value === "male" ? "bold" : "normal"}
            style={{ transition: "all 0.3s" }}>
            {isChinese ? "阳 · 男" : "Yang ♂"}
          </text>
          {/* Yang dot */}
          <circle cx={cx} cy={cy - r/2} r={6}
            fill={maleActive ? "rgba(10,8,20,0.8)" : "rgba(10,8,20,0.3)"}
            stroke="rgba(217,169,106,0.2)" strokeWidth="1"
            style={{ transition: "all 0.3s" }} />
        </g>

        {/* Yin (female) — left half */}
        <g
          className="cursor-pointer"
          onClick={() => onChange("female")}
          onMouseEnter={() => setHovered("female")}
          onMouseLeave={() => setHovered(null)}
        >
          <path
            d={`M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} A${r/2} ${r/2} 0 0 1 ${cx} ${cy} A${r/2} ${r/2} 0 0 0 ${cx} ${cy - r}`}
            fill={femaleActive ? "url(#yinGrad)" : "rgba(139,92,246,0.02)"}
            stroke={femaleActive ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.06)"}
            strokeWidth={value === "female" ? 2 : 0.5}
            filter={value === "female" ? "url(#yinGlow)" : ""}
            style={{ transition: "all 0.5s ease" }}
          />
          {/* Moon icon */}
          <text x={cx - 35} y={cy - 15} textAnchor="middle" fontSize="28"
            opacity={femaleActive ? 1 : 0.3} style={{ transition: "opacity 0.3s" }}>
            🌙
          </text>
          {/* Label */}
          <text x={cx - 35} y={cy + 15} textAnchor="middle"
            fill={femaleActive ? "rgba(139,92,246,0.9)" : "rgba(139,92,246,0.3)"}
            fontSize="13" fontWeight={value === "female" ? "bold" : "normal"}
            style={{ transition: "all 0.3s" }}>
            {isChinese ? "阴 · 女" : "Yin ♀"}
          </text>
          {/* Yin dot */}
          <circle cx={cx} cy={cy + r/2} r={6}
            fill={femaleActive ? "rgba(217,169,106,0.5)" : "rgba(217,169,106,0.1)"}
            stroke="rgba(139,92,246,0.2)" strokeWidth="1"
            style={{ transition: "all 0.3s" }} />
        </g>

        {/* Selection pulse */}
        {value && (
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={value === "male" ? "rgba(217,169,106,0.15)" : "rgba(139,92,246,0.15)"} strokeWidth="1">
            <animate attributeName="r" values={`${r};${r+8};${r}`} dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Energy particles — orbiting */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <circle key={i} cx={cx} cy={cy} r="1.5" fill="rgba(217,169,106,0.4)">
            <animateMotion
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
              path={`M0,0 A${r - 10 + i * 5},${r - 10 + i * 5} 0 1,${i % 2} ${0.01},0`}
            />
            <animate attributeName="opacity" values="0;0.6;0" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}
