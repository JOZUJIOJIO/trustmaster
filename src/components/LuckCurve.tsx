"use client";

import { useState } from "react";
import type { BaziChart } from "@/lib/bazi";

/**
 * 大运人生走势曲线图 (SVG)
 * X = age (0-80), Y = luck score
 * Each 10-year period colored by its element
 */

const ELEMENT_COLORS: Record<string, string> = {
  木: "#22c55e", 火: "#ef4444", 土: "#c9956b", 金: "#f59e0b", 水: "#3b82f6",
};

// Score a luck cycle based on ten god relationship to day master
function scoreCycle(tenGod: string, dayMasterStrength: string): number {
  const isStrong = dayMasterStrength === "strong";
  const scores: Record<string, [number, number]> = {
    // [score if strong, score if weak]
    比肩: [40, 70], 劫财: [35, 65],
    食神: [75, 50], 伤官: [70, 45],
    正财: [80, 40], 偏财: [75, 45],
    正官: [65, 55], 七杀: [55, 50],
    正印: [50, 80], 偏印: [45, 75],
  };
  const [s, w] = scores[tenGod] || [55, 55];
  return isStrong ? s : w;
}

export default function LuckCurve({ chart }: { chart: BaziChart }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!chart.luckCycles || chart.luckCycles.length === 0) return null;

  const cycles = chart.luckCycles;
  const birthYear = parseInt(chart.solarDate);
  const currentAge = new Date().getFullYear() - birthYear;

  // Calculate scores for each cycle
  const cycleScores = cycles.map((c) =>
    scoreCycle(c.tenGod, chart.dayMasterStrength)
  );

  // SVG dimensions
  const W = 600, H = 200;
  const padL = 35, padR = 20, padT = 25, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // X axis: age range
  const minAge = cycles[0].startAge;
  const maxAge = cycles[cycles.length - 1].startAge + 10;
  const ageRange = maxAge - minAge;

  const toX = (age: number) => padL + ((age - minAge) / ageRange) * plotW;
  const toY = (score: number) => padT + plotH - ((score - 20) / 80) * plotH;

  // Build smooth path through cycle midpoints
  const points = cycles.map((c, i) => ({
    x: toX(c.startAge + 5), // midpoint of decade
    y: toY(cycleScores[i]),
  }));

  // Catmull-Rom to cubic bezier
  let pathD = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    pathD += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  // Area fill path
  const areaD = pathD + ` L${points[points.length - 1].x},${padT + plotH} L${points[0].x},${padT + plotH} Z`;

  // Current age marker position (interpolate)
  let currentX = toX(currentAge);
  let currentY = padT + plotH / 2;
  for (let i = 0; i < cycles.length; i++) {
    if (currentAge >= cycles[i].startAge && currentAge < cycles[i].startAge + 10) {
      const progress = (currentAge - cycles[i].startAge) / 10;
      const nextScore = i < cycles.length - 1 ? cycleScores[i + 1] : cycleScores[i];
      const interpolatedScore = cycleScores[i] + (nextScore - cycleScores[i]) * progress;
      currentX = toX(currentAge);
      currentY = toY(interpolatedScore);
      break;
    }
  }

  const currentCycleIdx = cycles.findIndex(
    (c) => currentAge >= c.startAge && currentAge < c.startAge + 10
  );

  return (
    <div className="space-y-3">
      {/* SVG Chart */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="min-w-[500px]"
        >
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(217,169,106,0.2)" />
              <stop offset="100%" stopColor="rgba(217,169,106,0)" />
            </linearGradient>
            <filter id="glowDot">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[30, 50, 70, 90].map((v) => (
            <g key={v}>
              <line
                x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)}
                stroke="rgba(255,255,255,0.03)" strokeWidth="1"
              />
              <text x={padL - 4} y={toY(v)} textAnchor="end" dominantBaseline="central" fill="rgba(217,169,106,0.15)" fontSize="8">
                {v}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#curveGrad)" />

          {/* Colored decade segments along bottom */}
          {cycles.map((c, i) => {
            const x1 = toX(c.startAge);
            const x2 = toX(c.startAge + 10);
            const isCurrent = i === currentCycleIdx;
            return (
              <g key={i}>
                <rect
                  x={x1} y={padT + plotH + 2}
                  width={x2 - x1} height={4}
                  rx={2}
                  fill={ELEMENT_COLORS[c.element] || "rgba(217,169,106,0.3)"}
                  opacity={isCurrent ? 0.8 : 0.3}
                />
                {/* Age labels */}
                <text
                  x={(x1 + x2) / 2} y={padT + plotH + 18}
                  textAnchor="middle" fill="rgba(217,169,106,0.25)" fontSize="8"
                >
                  {c.startAge}岁
                </text>
              </g>
            );
          })}

          {/* Main curve */}
          <path d={pathD} fill="none" stroke="rgba(217,169,106,0.5)" strokeWidth="2" strokeLinecap="round" />

          {/* Data points */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i;
            const cycle = cycles[i];
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Hit area */}
                <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
                {/* Dot */}
                <circle
                  cx={p.x} cy={p.y}
                  r={isHovered ? 5 : 3}
                  fill={ELEMENT_COLORS[cycle.element] || "rgba(217,169,106,0.8)"}
                  stroke={isHovered ? "rgba(255,255,255,0.3)" : "none"}
                  strokeWidth="1"
                  style={{ transition: "all 0.2s ease" }}
                />
                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={p.x - 55} y={p.y - 52}
                      width={110} height={40}
                      rx={6}
                      fill="rgba(18,16,28,0.95)"
                      stroke="rgba(217,169,106,0.2)"
                      strokeWidth="1"
                    />
                    <text x={p.x} y={p.y - 38} textAnchor="middle" fill="rgba(217,169,106,0.8)" fontSize="9" fontWeight="bold">
                      {cycle.stem}{cycle.branch} · {cycle.element} · {cycle.tenGod}
                    </text>
                    <text x={p.x} y={p.y - 24} textAnchor="middle" fill="rgba(217,169,106,0.4)" fontSize="8">
                      {cycle.startAge}-{cycle.startAge + 9}岁 · 运势 {cycleScores[i]}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Current age marker */}
          {currentCycleIdx >= 0 && (
            <g>
              <line
                x1={currentX} y1={padT} x2={currentX} y2={padT + plotH}
                stroke="rgba(217,169,106,0.3)" strokeWidth="1" strokeDasharray="3,3"
              />
              <circle cx={currentX} cy={currentY} r={6} fill="rgba(217,169,106,0.8)" filter="url(#glowDot)">
                <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x={currentX} y={padT + plotH + 32} textAnchor="middle" fill="rgba(217,169,106,0.6)" fontSize="9" fontWeight="bold">
                ← 当前 {currentAge}岁
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Hovered cycle detail */}
      {hoveredIdx !== null && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center transition-all animate-fadeIn" style={{ animationDuration: "0.2s" }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-lg font-bold text-amber-300">{cycles[hoveredIdx].stem}{cycles[hoveredIdx].branch}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${ELEMENT_COLORS[cycles[hoveredIdx].element]}22`, color: ELEMENT_COLORS[cycles[hoveredIdx].element] }}>
              {cycles[hoveredIdx].element}
            </span>
          </div>
          <p className="text-xs text-amber-200/40">
            {cycles[hoveredIdx].tenGod} · {cycles[hoveredIdx].nayin || ""} · {cycles[hoveredIdx].startAge}-{cycles[hoveredIdx].startAge + 9}岁
          </p>
          <p className="text-[10px] text-amber-200/25 mt-1">
            {cycleScores[hoveredIdx] >= 70 ? "🌟 运势高峰期，适合积极进取" :
             cycleScores[hoveredIdx] >= 50 ? "☀️ 运势平稳期，宜稳中求进" :
             "🌙 运势蛰伏期，宜修身养性"}
          </p>
        </div>
      )}
    </div>
  );
}
