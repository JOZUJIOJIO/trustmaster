"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { calculateBazi, CHINESE_HOURS, STEM_ELEMENTS, type BaziChart } from "@/lib/bazi";
import { ELEMENT_RECOMMENDATIONS } from "@/lib/bazi-glossary";
import RadarChart from "@/components/RadarChart";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/components/Toast";

type Step = "input" | "result";

// Five Elements relationship scoring
function calcCompatibility(a: BaziChart, b: BaziChart) {
  let score = 50; // base

  // 1. Day Master element relationship
  const elA = a.dayMasterElement;
  const elB = b.dayMasterElement;
  const generates: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const controls: Record<string, string> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };

  if (generates[elA] === elB || generates[elB] === elA) score += 20; // 相生
  if (elA === elB) score += 10; // 同类
  if (controls[elA] === elB || controls[elB] === elA) score -= 5; // 相克 (mild)

  // 2. Five Elements complementarity
  const elementsA = a.fiveElements;
  const elementsB = b.fiveElements;
  const allElements = ["木", "火", "土", "金", "水"] as const;
  let complementScore = 0;
  for (const el of allElements) {
    const sumA = elementsA[el];
    const sumB = elementsB[el];
    // If one is weak and the other is strong, they complement
    if ((sumA <= 1 && sumB >= 3) || (sumB <= 1 && sumA >= 3)) complementScore += 5;
    // If both are balanced, mild bonus
    if (Math.abs(sumA - sumB) <= 1) complementScore += 2;
  }
  score += complementScore;

  // 3. Lucky element match
  if (a.luckyElement === elB || b.luckyElement === elA) score += 10;

  // 4. Zodiac compatibility (simplified)
  const compatible: Record<string, string[]> = {
    鼠: ["龙", "猴", "牛"], 牛: ["蛇", "鸡", "鼠"], 虎: ["马", "狗", "猪"],
    兔: ["羊", "猪", "狗"], 龙: ["鼠", "猴", "鸡"], 蛇: ["牛", "鸡", "龙"],
    马: ["虎", "狗", "羊"], 羊: ["兔", "马", "猪"], 猴: ["鼠", "龙", "蛇"],
    鸡: ["牛", "蛇", "龙"], 狗: ["虎", "兔", "马"], 猪: ["兔", "羊", "虎"],
  };
  if (compatible[a.zodiacAnimal]?.includes(b.zodiacAnimal)) score += 8;

  return Math.min(99, Math.max(20, score));
}

function calcDimensionScores(a: BaziChart, b: BaziChart) {
  const elA = a.dayMasterElement;
  const elB = b.dayMasterElement;
  const generates: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };

  const isGenerate = generates[elA] === elB || generates[elB] === elA;
  const isSame = elA === elB;

  return {
    love: Math.min(99, 50 + (isGenerate ? 25 : isSame ? 15 : 5) + Math.floor(Math.random() * 10)),
    career: Math.min(99, 50 + (isSame ? 20 : isGenerate ? 15 : 8) + Math.floor(Math.random() * 10)),
    friendship: Math.min(99, 55 + (isGenerate ? 20 : 10) + Math.floor(Math.random() * 10)),
    communication: Math.min(99, 50 + (isSame ? 25 : isGenerate ? 18 : 10) + Math.floor(Math.random() * 8)),
  };
}

function ScoreCircle({ score, size = 120 }: { score: number; size?: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = size * 0.4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-amber-300">{score}</div>
        <div className="text-[9px] text-amber-200/30">兼容度</div>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, icon }: { label: string; score: number; icon: string }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-amber-200/60 flex items-center gap-1"><span>{icon}</span>{label}</span>
        <span className="text-xs text-amber-200/40">{score}/100</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12101c]" />}>
      <CompatibilityContent />
    </Suspense>
  );
}

function CompatibilityContent() {
  const { isChinese, t } = useLocale();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("input");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Person A
  const [dateA, setDateA] = useState("");
  const [nameA, setNameA] = useState("");
  // Person B
  const [dateB, setDateB] = useState("");
  const [nameB, setNameB] = useState("");

  // Pre-fill from invite link: ?from=name&date=1990-01-15
  useEffect(() => {
    const fromName = searchParams.get("from");
    const fromDate = searchParams.get("date");
    if (fromName) setNameA(decodeURIComponent(fromName));
    if (fromDate && /^\d{4}-\d{2}-\d{2}$/.test(fromDate)) setDateA(fromDate);
  }, [searchParams]);

  const [chartA, setChartA] = useState<BaziChart | null>(null);
  const [chartB, setChartB] = useState<BaziChart | null>(null);

  const handleAnalyze = () => {
    if (!dateA || !dateB) return;
    const [yA, mA, dA] = dateA.split("-").map(Number);
    const [yB, mB, dB] = dateB.split("-").map(Number);
    setChartA(calculateBazi(yA, mA, dA, "午", "male"));
    setChartB(calculateBazi(yB, mB, dB, "午", "female"));
    setStep("result");
  };

  const overall = chartA && chartB ? calcCompatibility(chartA, chartB) : 0;
  const dimensions = chartA && chartB ? calcDimensionScores(chartA, chartB) : null;

  return (
    <div className="min-h-screen bg-[#12101c]">
      <PageHeader title={isChinese ? "双人合盘" : "Compatibility"} />

      <main className="max-w-lg mx-auto px-4 py-8 pb-24">
        {step === "input" ? (
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-400/30 text-xs mb-3">
                <span>☸</span><span>Compatibility Analysis</span><span>☸</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-gradient-gold">{isChinese ? "双人合盘分析" : "Compatibility Analysis"}</h1>
              <p className="text-amber-200/40 text-sm mt-2">{isChinese ? "输入两人出生日期，分析五行互补与性格兼容" : "Enter two birth dates to analyze Five Elements compatibility"}</p>
            </div>

            {/* Person A */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">👤</span>
                <span className="text-sm font-semibold text-amber-200/70">{isChinese ? "第一个人" : "Person 1"}</span>
              </div>
              <input
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder={isChinese ? "姓名（可选）" : "Name (optional)"}
                className="w-full bg-white/5 border border-amber-400/15 rounded-xl px-4 py-2.5 text-amber-100 text-sm placeholder:text-amber-200/20 focus:outline-none focus:border-amber-400/30"
              />
              <input
                type="date"
                value={dateA}
                onChange={(e) => setDateA(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                min="1940-01-01"
                className="w-full bg-white/5 border border-amber-400/15 rounded-xl px-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-400/30"
              />
            </div>

            {/* VS divider */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-px bg-amber-400/15" />
              <span className="text-amber-400/30 text-xs font-bold tracking-widest">VS</span>
              <div className="w-16 h-px bg-amber-400/15" />
            </div>

            {/* Person B */}
            <div className="bg-white/[0.03] border border-purple-400/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">👤</span>
                <span className="text-sm font-semibold text-purple-200/70">{isChinese ? "第二个人" : "Person 2"}</span>
              </div>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                placeholder={isChinese ? "姓名（可选）" : "Name (optional)"}
                className="w-full bg-white/5 border border-purple-400/15 rounded-xl px-4 py-2.5 text-purple-100 text-sm placeholder:text-purple-200/20 focus:outline-none focus:border-purple-400/30"
              />
              <input
                type="date"
                value={dateB}
                onChange={(e) => setDateB(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                min="1940-01-01"
                className="w-full bg-white/5 border border-purple-400/15 rounded-xl px-4 py-2.5 text-purple-100 text-sm focus:outline-none focus:border-purple-400/30"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!dateA || !dateB}
              className="w-full py-4 rounded-2xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              {isChinese ? "开始分析兼容度" : "Analyze Compatibility"}
            </button>

            {/* Invite link — share your info so the other person can fill in theirs */}
            {dateA && (
              <button
                onClick={() => {
                  const baseUrl = window.location.origin;
                  const params = new URLSearchParams();
                  params.set("from", nameA || (isChinese ? "好友" : "Friend"));
                  params.set("date", dateA);
                  const link = `${baseUrl}/compatibility?${params.toString()}`;
                  navigator.clipboard.writeText(link).then(() => {
                    setInviteCopied(true);
                    toast(isChinese ? "邀请链接已复制！" : "Invite link copied!", "success");
                    setTimeout(() => setInviteCopied(false), 2000);
                  });
                }}
                className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer bg-purple-800/30 hover:bg-purple-700/30 text-purple-200/70 border border-purple-400/15 transition-all"
              >
                {inviteCopied
                  ? (isChinese ? "✓ 链接已复制" : "✓ Link copied")
                  : (isChinese ? "💌 邀请 TA 来合盘" : "💌 Invite them to match")}
              </button>
            )}
          </div>
        ) : chartA && chartB && dimensions ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-400/30 text-xs mb-3">
                <span>☸</span><span>Compatibility Result</span><span>☸</span>
              </div>
            </div>

            {/* Two people + score */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-700/20 border border-amber-400/20 flex items-center justify-center text-2xl">{chartA.zodiacEmoji}</div>
                <div className="text-xs text-amber-200/70 mt-1.5 font-semibold">{nameA || "A"}</div>
                <div className="text-[10px] text-amber-200/30">{chartA.dayMaster}{chartA.dayMasterElement}</div>
              </div>

              <ScoreCircle score={overall} />

              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-purple-700/20 border border-purple-400/20 flex items-center justify-center text-2xl">{chartB.zodiacEmoji}</div>
                <div className="text-xs text-purple-200/70 mt-1.5 font-semibold">{nameB || "B"}</div>
                <div className="text-[10px] text-purple-200/30">{chartB.dayMaster}{chartB.dayMasterElement}</div>
              </div>
            </div>

            {/* Overall verdict */}
            <div className="text-center">
              <div className="text-sm font-semibold" style={{ color: overall >= 80 ? "#22c55e" : overall >= 60 ? "#f59e0b" : "#ef4444" }}>
                {overall >= 85 ? "天作之合" : overall >= 75 ? "非常契合" : overall >= 60 ? "良好搭配" : overall >= 45 ? "需要磨合" : "差异较大"}
              </div>
              <p className="text-[10px] text-amber-200/30 mt-1">
                {chartA.dayMasterElement}（{nameA || "A"}）{
                  (() => {
                    const generates: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
                    if (generates[chartA.dayMasterElement] === chartB.dayMasterElement) return "生";
                    if (generates[chartB.dayMasterElement] === chartA.dayMasterElement) return "得";
                    if (chartA.dayMasterElement === chartB.dayMasterElement) return "同";
                    return "配";
                  })()
                } {chartB.dayMasterElement}（{nameB || "B"}）
              </p>
            </div>

            {/* Dimension scores */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-2">多 维 兼 容</h3>
              <DimensionBar label="恋爱关系" score={dimensions.love} icon="❤️" />
              <DimensionBar label="事业搭档" score={dimensions.career} icon="💼" />
              <DimensionBar label="朋友默契" score={dimensions.friendship} icon="🤝" />
              <DimensionBar label="沟通理解" score={dimensions.communication} icon="💬" />
            </div>

            {/* Five Elements comparison */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-3">五 行 对 比</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-center text-[10px] text-amber-200/40 mb-1">{nameA || "A"}</div>
                  <RadarChart
                    size={140}
                    maxValue={Math.max(...Object.values(chartA.fiveElements), 3)}
                    data={[
                      { label: "木", value: chartA.fiveElements.木, color: "#22c55e", emoji: "🌳" },
                      { label: "火", value: chartA.fiveElements.火, color: "#ef4444", emoji: "🔥" },
                      { label: "土", value: chartA.fiveElements.土, color: "#a3712a", emoji: "⛰️" },
                      { label: "金", value: chartA.fiveElements.金, color: "#f59e0b", emoji: "⚙️" },
                      { label: "水", value: chartA.fiveElements.水, color: "#3b82f6", emoji: "💧" },
                    ]}
                  />
                </div>
                <div>
                  <div className="text-center text-[10px] text-purple-200/40 mb-1">{nameB || "B"}</div>
                  <RadarChart
                    size={140}
                    maxValue={Math.max(...Object.values(chartB.fiveElements), 3)}
                    data={[
                      { label: "木", value: chartB.fiveElements.木, color: "#22c55e", emoji: "🌳" },
                      { label: "火", value: chartB.fiveElements.火, color: "#ef4444", emoji: "🔥" },
                      { label: "土", value: chartB.fiveElements.土, color: "#a3712a", emoji: "⛰️" },
                      { label: "金", value: chartB.fiveElements.金, color: "#f59e0b", emoji: "⚙️" },
                      { label: "水", value: chartB.fiveElements.水, color: "#3b82f6", emoji: "💧" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Analysis text */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-3">关 系 洞 察</h3>
              <div className="space-y-3">
                <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                  <div className="text-xs font-semibold text-amber-200/70 mb-1">✨ 互补优势</div>
                  <p className="text-[11px] text-amber-100/50 leading-relaxed">
                    {(() => {
                      const weakA = (Object.entries(chartA.fiveElements) as [string, number][]).filter(([,v]) => v <= 1).map(([k]) => k);
                      const strongB = (Object.entries(chartB.fiveElements) as [string, number][]).filter(([,v]) => v >= 3).map(([k]) => k);
                      const complement = weakA.filter(e => strongB.includes(e));
                      if (complement.length > 0) return `${nameA || "A"}的${complement.join("、")}较弱，而${nameB || "B"}恰好在这方面较强，形成天然互补。这意味着在生活中，${nameB || "B"}能自然地弥补${nameA || "A"}的不足。`;
                      return `两人的五行分布各有侧重，在不同领域有各自的优势。相互欣赏对方的长处，是维系关系的关键。`;
                    })()}
                  </p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                  <div className="text-xs font-semibold text-amber-200/70 mb-1">⚠️ 需要注意</div>
                  <p className="text-[11px] text-amber-100/50 leading-relaxed">
                    {chartA.dayMasterElement === chartB.dayMasterElement
                      ? "两人日主五行相同，性格相似，容易产生共鸣但也可能因为太像而产生摩擦。建议在分歧时学会退让，给对方空间。"
                      : `${nameA || "A"}属${chartA.dayMasterElement}，${nameB || "B"}属${chartB.dayMasterElement}。不同五行带来不同视角，沟通时要理解对方的思维方式，避免用自己的标准要求对方。`}
                  </p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                  <div className="text-xs font-semibold text-amber-200/70 mb-1">💡 相处建议</div>
                  <p className="text-[11px] text-amber-100/50 leading-relaxed">
                    {(() => {
                      const rec = ELEMENT_RECOMMENDATIONS[chartA.luckyElement];
                      return rec ? `共同活动建议：可以多去${rec.directions.split("、")[0]}方向出游；约会时选择${rec.colors.split("、")[0]}系的餐厅或环境，有助于增进感情。` : "多创造共同体验的机会，在合作中增进了解。";
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Share result */}
            <button
              onClick={() => {
                const text = isChinese
                  ? `我和${nameB || "TA"}的合盘兼容度是 ${overall}% 🔮 来 TrustMaster 测测你们的缘分吧！`
                  : `Our compatibility score is ${overall}%! 🔮 Check yours on TrustMaster!`;
                const shareUrl = `${window.location.origin}/compatibility`;
                if (navigator.share) {
                  navigator.share({ title: "TrustMaster Compatibility", text, url: shareUrl });
                } else {
                  navigator.clipboard.writeText(`${text}\n${shareUrl}`).then(() => {
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  });
                }
              }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm cursor-pointer bg-gradient-to-r from-purple-800/50 via-purple-700/50 to-purple-800/50 hover:from-purple-700/50 hover:via-purple-600/50 hover:to-purple-700/50 text-purple-200/80 border border-purple-400/15 transition-all"
            >
              {shareCopied ? (isChinese ? "✓ 已复制" : "✓ Copied") : (isChinese ? "📤 分享结果" : "📤 Share Result")}
            </button>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => { setStep("input"); setChartA(null); setChartB(null); }} className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5">
                {isChinese ? "重新分析" : "Start Over"}
              </button>
              <Link href="/fortune" className="flex-1 py-3 rounded-xl text-sm font-medium text-center bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5">
                {isChinese ? "个人分析" : "My Analysis"}
              </Link>
            </div>
          </div>
        ) : null}
      </main>
      <BottomNav />
    </div>
  );
}
