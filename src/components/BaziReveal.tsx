"use client";

import { useState, useEffect } from "react";
import type { BaziChart } from "@/lib/bazi";

const ELEMENT_COLORS: Record<string, string> = {
  木: "#22c55e", 火: "#ef4444", 土: "#a3712a", 金: "#f59e0b", 水: "#3b82f6",
};

const ELEMENT_SYMBOLS: Record<string, string> = {
  木: "🌳", 火: "🔥", 土: "⛰️", 金: "⚙️", 水: "💧",
};

/**
 * 命盘揭示仪式动画
 * Phase 1: 太极旋转 + "天机推演" 文字
 * Phase 2: 四柱依次从上方落入
 * Phase 3: 五行粒子汇聚到中心
 * Phase 4: 金色封印解开 → 回调 onComplete
 */
export default function BaziReveal({
  chart,
  userName,
  onComplete,
}: {
  chart: BaziChart;
  userName: string;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [pillarIndex, setPillarIndex] = useState(-1);

  useEffect(() => {
    // Phase 0: Initial (太极旋转)
    const t1 = setTimeout(() => setPhase(1), 800);
    // Phase 1: Show text "天机推演中..."
    const t2 = setTimeout(() => setPhase(2), 2000);
    // Phase 2: Pillars drop in one by one
    const t3 = setTimeout(() => setPillarIndex(0), 2200);
    const t4 = setTimeout(() => setPillarIndex(1), 2600);
    const t5 = setTimeout(() => setPillarIndex(2), 3000);
    const t6 = setTimeout(() => setPillarIndex(3), 3400);
    // Phase 3: Five elements converge
    const t7 = setTimeout(() => setPhase(3), 4000);
    // Phase 4: Seal break → complete
    const t8 = setTimeout(() => setPhase(4), 5200);
    const t9 = setTimeout(() => onComplete(), 6000);

    return () => {
      [t1, t2, t3, t4, t5, t6, t7, t8, t9].forEach(clearTimeout);
    };
  }, [onComplete]);

  const pillars = [
    { label: "年柱", pillar: chart.yearPillar },
    { label: "月柱", pillar: chart.monthPillar },
    { label: "日柱", pillar: chart.dayPillar },
    { label: "时柱", pillar: chart.hourPillar },
  ];

  const elements = Object.entries(chart.fiveElements).filter(([, v]) => v > 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0814] flex items-center justify-center overflow-hidden">
      {/* Background ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(217, 169, 106, ${0.1 + Math.random() * 0.2})`,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div
        className="absolute transition-all duration-1000"
        style={{
          width: phase >= 3 ? 600 : 300,
          height: phase >= 3 ? 600 : 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(217,119,6,${phase >= 3 ? 0.12 : 0.06}) 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
      />

      {/* === Phase 0-1: Rotating Taiji === */}
      <div
        className="absolute transition-all duration-1000"
        style={{
          opacity: phase <= 2 ? 1 : 0,
          transform: `scale(${phase >= 2 ? 0.6 : 1})`,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="animate-spin"
          style={{ animationDuration: "8s" }}
        >
          {/* Outer ring */}
          <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(217,169,106,0.2)" strokeWidth="1" />
          {/* Bagua trigrams ring */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 - 90) * (Math.PI / 180);
            const x = 60 + 48 * Math.cos(angle);
            const y = 60 + 48 * Math.sin(angle);
            const trigrams = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(217,169,106,0.3)"
                fontSize="10"
              >
                {trigrams[i]}
              </text>
            );
          })}
          {/* Yin-yang */}
          <circle cx="60" cy="60" r="24" fill="none" stroke="rgba(217,169,106,0.3)" strokeWidth="0.5" />
          <path d="M60 36 A12 12 0 0 1 60 60 A12 12 0 0 0 60 84 A24 24 0 0 1 60 36" fill="rgba(217,169,106,0.15)" />
          <path d="M60 36 A12 12 0 0 0 60 60 A12 12 0 0 1 60 84 A24 24 0 0 0 60 36" fill="rgba(217,169,106,0.05)" />
          <circle cx="60" cy="48" r="3" fill="rgba(217,169,106,0.08)" />
          <circle cx="60" cy="72" r="3" fill="rgba(217,169,106,0.2)" />
        </svg>
      </div>

      {/* === Phase 1: Text === */}
      <div
        className="absolute flex flex-col items-center transition-all duration-700"
        style={{
          opacity: phase >= 1 && phase <= 2 ? 1 : 0,
          transform: `translateY(${phase >= 1 ? 80 : 100}px)`,
        }}
      >
        <p className="text-amber-400/60 text-sm tracking-[0.4em] font-light">
          天 机 推 演 中
        </p>
        <div className="flex gap-1.5 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400/40"
              style={{
                animation: "breathe 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* === Phase 2: Pillars Drop In === */}
      <div
        className="absolute flex gap-4 transition-opacity duration-500"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {pillars.map(({ label, pillar }, i) => (
          <div
            key={label}
            className="text-center transition-all"
            style={{
              opacity: pillarIndex >= i ? 1 : 0,
              transform: `translateY(${pillarIndex >= i ? 0 : -60}px)`,
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transitionDelay: `${i * 0.05}s`,
            }}
          >
            <div className="text-[10px] text-amber-400/40 mb-2 tracking-widest">{label}</div>
            <div
              className="relative bg-[#16132a] border border-amber-400/20 rounded-xl px-4 py-3 min-w-[56px]"
              style={{
                boxShadow: pillarIndex >= i ? `0 0 20px rgba(217,169,106,${0.1 + i * 0.03}), inset 0 0 15px rgba(217,169,106,0.03)` : "none",
                transition: "box-shadow 0.8s ease",
                transitionDelay: `${0.3 + i * 0.1}s`,
              }}
            >
              <div className="text-2xl font-bold text-amber-300">{pillar.stem}</div>
              <div className="text-[10px] text-amber-200/30 mt-0.5">{pillar.stemElement}</div>
              <div className="w-6 h-px bg-amber-400/15 mx-auto my-1" />
              <div className="text-2xl font-bold text-amber-100">{pillar.branch}</div>
              <div className="text-[10px] text-amber-200/30 mt-0.5">{pillar.branchElement}</div>
            </div>
            <div className="text-xs mt-1.5 text-amber-200/25">{pillar.animal}</div>
          </div>
        ))}
      </div>

      {/* === Phase 3: Five Element Particles Converge === */}
      {phase >= 3 && (
        <div className="absolute inset-0 pointer-events-none">
          {elements.map(([el, count], i) => {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const startR = 200;
            const startX = 50 + (startR * Math.cos(angle)) / (typeof window !== "undefined" ? window.innerWidth / 100 : 4);
            const startY = 50 + (startR * Math.sin(angle)) / (typeof window !== "undefined" ? window.innerHeight / 100 : 8);
            return Array.from({ length: Math.min(count, 4) }).map((_, j) => (
              <div
                key={`${el}-${j}`}
                className="absolute rounded-full"
                style={{
                  width: 8 + count * 2,
                  height: 8 + count * 2,
                  background: `radial-gradient(circle, ${ELEMENT_COLORS[el]}, transparent)`,
                  left: `${startX + (Math.random() - 0.5) * 10}%`,
                  top: `${startY + (Math.random() - 0.5) * 10}%`,
                  opacity: 0,
                  animation: `converge-${i} 1.2s ease-in forwards`,
                  animationDelay: `${j * 0.1}s`,
                }}
              />
            ));
          })}
        </div>
      )}

      {/* === Phase 3: Element Labels Appear === */}
      <div
        className="absolute flex gap-6 transition-all duration-700"
        style={{
          opacity: phase >= 3 && phase < 4 ? 1 : 0,
          bottom: "30%",
        }}
      >
        {elements.map(([el, count], i) => (
          <div
            key={el}
            className="text-center transition-all"
            style={{
              opacity: phase >= 3 ? 1 : 0,
              transform: `translateY(${phase >= 3 ? 0 : 20}px)`,
              transition: "all 0.5s ease",
              transitionDelay: `${0.3 + i * 0.15}s`,
            }}
          >
            <div className="text-xl">{ELEMENT_SYMBOLS[el]}</div>
            <div className="text-xs font-bold mt-1" style={{ color: ELEMENT_COLORS[el] }}>{el}</div>
            <div className="text-[10px] text-amber-200/30">×{count}</div>
          </div>
        ))}
      </div>

      {/* === Phase 4: Seal Break === */}
      <div
        className="absolute flex flex-col items-center transition-all duration-700"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transform: `scale(${phase >= 4 ? 1 : 0.8})`,
        }}
      >
        {/* Golden ring expanding */}
        <div
          className="rounded-full border-2 border-amber-400/40"
          style={{
            width: phase >= 4 ? 200 : 0,
            height: phase >= 4 ? 200 : 0,
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 0 40px rgba(217,169,106,0.2), inset 0 0 40px rgba(217,169,106,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">{chart.zodiacEmoji}</div>
            <div className="text-lg font-bold text-amber-200">
              {chart.dayMaster}{chart.dayMasterElement}命
            </div>
            {userName && <div className="text-xs text-amber-200/40 mt-1">{userName}</div>}
          </div>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-amber-200/20 hover:text-amber-200/40 text-xs cursor-pointer transition-colors"
      >
        跳过动画 →
      </button>

      {/* Convergence keyframes injected via style tag */}
      <style>{`
        @keyframes converge-0 { 0% { opacity: 0.8; } 100% { opacity: 0; left: 50%; top: 50%; } }
        @keyframes converge-1 { 0% { opacity: 0.8; } 100% { opacity: 0; left: 50%; top: 50%; } }
        @keyframes converge-2 { 0% { opacity: 0.8; } 100% { opacity: 0; left: 50%; top: 50%; } }
        @keyframes converge-3 { 0% { opacity: 0.8; } 100% { opacity: 0; left: 50%; top: 50%; } }
        @keyframes converge-4 { 0% { opacity: 0.8; } 100% { opacity: 0; left: 50%; top: 50%; } }
      `}</style>
    </div>
  );
}
