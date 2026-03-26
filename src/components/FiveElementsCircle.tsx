"use client";

import { useState } from "react";

const ELEMENTS = ["木", "火", "土", "金", "水"] as const;

const ELEMENT_COLORS: Record<string, string> = {
  木: "#22c55e", 火: "#ef4444", 土: "#c9956b", 金: "#f59e0b", 水: "#3b82f6",
};

const ELEMENT_EMOJI: Record<string, string> = {
  木: "🌳", 火: "🔥", 土: "⛰️", 金: "⚙️", 水: "💧",
};

// Five Elements cycle: 木→火→土→金→水→木
const SHENG_CYCLE = [
  ["木", "火"], ["火", "土"], ["土", "金"], ["金", "水"], ["水", "木"],
];
// Ke (克) cycle: 木→土→水→火→金→木
const KE_CYCLE = [
  ["木", "土"], ["土", "水"], ["水", "火"], ["火", "金"], ["金", "木"],
];

const ELEMENT_IMPACT: Record<string, Record<string, string>> = {
  木: {
    strong: "木旺之人，性格坚韧，富有创造力和成长力，如参天大树般稳健。事业上善于规划长远布局。",
    weak: "木弱需补，宜多亲近绿色植物、东方位。春季是你的能量高峰期。",
    organs: "肝胆系统",
  },
  火: {
    strong: "火旺之人，热情洋溢，感染力强，行动力十足。适合领导和创意类工作。",
    weak: "火弱需温，宜多用红色元素、南方位。夏季可增强你的气场。",
    organs: "心脏/小肠",
  },
  土: {
    strong: "土旺之人，稳重可靠，踏实厚道，是团队中的定海神针。财运通常较稳。",
    weak: "土弱需培，宜接地气、多接触大自然。长夏（换季期）注意脾胃调养。",
    organs: "脾胃系统",
  },
  金: {
    strong: "金旺之人，果断坚毅，执行力强，追求完美。适合金融、法律、技术领域。",
    weak: "金弱需锻，宜佩戴金属饰品、白色衣物。秋季是你的充能期。",
    organs: "肺/大肠",
  },
  水: {
    strong: "水旺之人，聪慧灵活，善于变通，社交能力出众。适合贸易、传媒、顾问行业。",
    weak: "水弱需润，宜亲近水源、北方位。冬季是你的蓄能期。",
    organs: "肾/膀胱",
  },
};

interface Props {
  fiveElements: { 木: number; 火: number; 土: number; 金: number; 水: number };
  dayMasterElement: string;
  luckyElement: string;
  unluckyElement: string;
}

export default function FiveElementsCircle({ fiveElements, dayMasterElement, luckyElement, unluckyElement }: Props) {
  const [activeEl, setActiveEl] = useState<string | null>(null);
  const maxCount = Math.max(...Object.values(fiveElements), 1);

  // Layout: elements around a circle
  const cx = 160, cy = 160, r = 110;
  const positions = ELEMENTS.map((_, i) => {
    const angle = ((i * 72) - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const isSheng = (from: string, to: string) =>
    SHENG_CYCLE.some(([a, b]) => a === from && b === to);
  const isKe = (from: string, to: string) =>
    KE_CYCLE.some(([a, b]) => a === from && b === to);

  // Determine which connections to highlight
  const highlightedSheng: string[] = [];
  const highlightedKe: string[] = [];
  if (activeEl) {
    SHENG_CYCLE.forEach(([a, b]) => {
      if (a === activeEl || b === activeEl) highlightedSheng.push(`${a}-${b}`);
    });
    KE_CYCLE.forEach(([a, b]) => {
      if (a === activeEl || b === activeEl) highlightedKe.push(`${a}-${b}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative flex justify-center">
        <svg viewBox="0 0 320 320" className="overflow-visible w-full max-w-[300px]">
          {/* Background glow */}
          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor={ELEMENT_COLORS[dayMasterElement]} stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrow marker for sheng */}
            <marker id="arrowSheng" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="1" />
            </marker>
            {/* Arrow marker for ke */}
            <marker id="arrowKe" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="1" />
            </marker>
          </defs>

          {/* Center glow */}
          <circle cx={cx} cy={cy} r="60" fill="url(#centerGlow)" />

          {/* Sheng (生) connections — outer curved lines */}
          {SHENG_CYCLE.map(([from, to]) => {
            const fi = ELEMENTS.indexOf(from as typeof ELEMENTS[number]);
            const ti = ELEMENTS.indexOf(to as typeof ELEMENTS[number]);
            const fp = positions[fi], tp = positions[ti];
            const key = `${from}-${to}`;
            const isActive = highlightedSheng.includes(key);
            // Curved path (arc slightly outside)
            const midAngle = (((fi * 72) + (ti * 72)) / 2 - 90) * (Math.PI / 180);
            const cpx = cx + (r + 30) * Math.cos(midAngle);
            const cpy = cy + (r + 30) * Math.sin(midAngle);
            return (
              <g key={`sheng-${key}`}>
                <path
                  d={`M${fp.x},${fp.y} Q${cpx},${cpy} ${tp.x},${tp.y}`}
                  fill="none"
                  stroke={isActive ? "rgba(34,197,94,0.6)" : "rgba(34,197,94,0.12)"}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? "none" : "4,4"}
                  markerEnd="url(#arrowSheng)"
                  style={{ transition: "all 0.3s ease" }}
                />
                {isActive && (
                  <text
                    x={cpx}
                    y={cpy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(34,197,94,0.7)"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    生
                  </text>
                )}
              </g>
            );
          })}

          {/* Ke (克) connections — inner straight lines */}
          {KE_CYCLE.map(([from, to]) => {
            const fi = ELEMENTS.indexOf(from as typeof ELEMENTS[number]);
            const ti = ELEMENTS.indexOf(to as typeof ELEMENTS[number]);
            const fp = positions[fi], tp = positions[ti];
            const key = `${from}-${to}`;
            const isActive = highlightedKe.includes(key);
            return (
              <g key={`ke-${key}`}>
                <line
                  x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                  stroke={isActive ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.06)"}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  strokeDasharray="3,5"
                  markerEnd="url(#arrowKe)"
                  style={{ transition: "all 0.3s ease" }}
                />
                {isActive && (
                  <text
                    x={(fp.x + tp.x) / 2}
                    y={(fp.y + tp.y) / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(239,68,68,0.5)"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    克
                  </text>
                )}
              </g>
            );
          })}

          {/* Element nodes */}
          {ELEMENTS.map((el, i) => {
            const pos = positions[i];
            const count = fiveElements[el] || 0;
            const nodeR = 20 + (count / maxCount) * 12;
            const isDay = el === dayMasterElement;
            const isLucky = el === luckyElement;
            const isUnlucky = el === unluckyElement;
            const isActive = activeEl === el;

            return (
              <g
                key={el}
                className="cursor-pointer"
                onClick={() => setActiveEl(activeEl === el ? null : el)}
                onMouseEnter={() => setActiveEl(el)}
                onMouseLeave={() => setActiveEl(null)}
              >
                {/* Glow ring for active / day master */}
                {(isActive || isDay) && (
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={nodeR + 6}
                    fill="none"
                    stroke={ELEMENT_COLORS[el]}
                    strokeWidth="1"
                    opacity={isActive ? 0.5 : 0.2}
                    style={{ transition: "all 0.3s ease" }}
                  >
                    {isDay && (
                      <animate attributeName="r" values={`${nodeR + 4};${nodeR + 8};${nodeR + 4}`} dur="3s" repeatCount="indefinite" />
                    )}
                  </circle>
                )}

                {/* Node background */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={nodeR}
                  fill={`rgba(${el === "木" ? "34,197,94" : el === "火" ? "239,68,68" : el === "土" ? "201,149,107" : el === "金" ? "245,158,11" : "59,130,246"},0.12)`}
                  stroke={ELEMENT_COLORS[el]}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={isActive ? 1 : 0.6}
                  filter={isActive ? "url(#glow)" : ""}
                  style={{ transition: "all 0.3s ease" }}
                />

                {/* Emoji */}
                <text
                  x={pos.x} y={pos.y - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="16"
                >
                  {ELEMENT_EMOJI[el]}
                </text>
                {/* Element name */}
                <text
                  x={pos.x} y={pos.y + 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={ELEMENT_COLORS[el]}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {el} ×{count}
                </text>

                {/* Badge: Day Master / Lucky / Unlucky */}
                {isDay && (
                  <text x={pos.x} y={pos.y - nodeR - 6} textAnchor="middle" fill="rgba(217,169,106,0.8)" fontSize="8" fontWeight="bold">
                    日主
                  </text>
                )}
                {isLucky && !isDay && (
                  <text x={pos.x} y={pos.y - nodeR - 6} textAnchor="middle" fill="rgba(34,197,94,0.7)" fontSize="8">
                    喜用
                  </text>
                )}
                {isUnlucky && (
                  <text x={pos.x} y={pos.y + nodeR + 12} textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize="8">
                    忌神
                  </text>
                )}
              </g>
            );
          })}

          {/* Center: Day Master info */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="rgba(217,169,106,0.6)" fontSize="10" letterSpacing="2">
            日主
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(217,169,106,0.9)" fontSize="16" fontWeight="bold">
            {dayMasterElement}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-amber-200/30">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-green-500/40" /> <span>相生</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-red-500/30 border-t border-dashed" /> <span>相克</span>
        </div>
        <span className="text-amber-200/15">点击元素查看详情</span>
      </div>

      {/* Active element detail panel */}
      {activeEl && ELEMENT_IMPACT[activeEl] && (
        <div
          className="bg-white/[0.03] border border-amber-400/10 rounded-xl p-4 space-y-2 transition-all duration-300"
          style={{
            borderColor: `${ELEMENT_COLORS[activeEl]}33`,
            boxShadow: `0 0 20px ${ELEMENT_COLORS[activeEl]}08`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{ELEMENT_EMOJI[activeEl]}</span>
            <span className="font-bold text-sm" style={{ color: ELEMENT_COLORS[activeEl] }}>{activeEl}行解读</span>
            {activeEl === luckyElement && <span className="text-[9px] bg-green-900/30 text-green-400/70 px-1.5 py-0.5 rounded">喜用神</span>}
            {activeEl === unluckyElement && <span className="text-[9px] bg-red-900/30 text-red-400/70 px-1.5 py-0.5 rounded">忌神</span>}
          </div>
          <p className="text-xs text-amber-100/50 leading-relaxed">
            {fiveElements[activeEl as keyof typeof fiveElements] >= 3
              ? ELEMENT_IMPACT[activeEl].strong
              : ELEMENT_IMPACT[activeEl].weak}
          </p>
          <div className="flex items-center gap-4 text-[10px] text-amber-200/30 pt-1 border-t border-white/5">
            <span>对应脏腑：{ELEMENT_IMPACT[activeEl].organs}</span>
            <span>·</span>
            <span>八字中有 {fiveElements[activeEl as keyof typeof fiveElements]} 个</span>
          </div>
        </div>
      )}
    </div>
  );
}
