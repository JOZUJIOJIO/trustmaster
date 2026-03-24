"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { calculateBazi, CHINESE_HOURS, type BaziChart, getTenGod, STEM_ELEMENTS } from "@/lib/bazi";
import { ELEMENT_RECOMMENDATIONS } from "@/lib/bazi-glossary";
import { Term } from "@/components/Tooltip";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Mode = "select" | "bazi" | "zodiac";
type Step = "date" | "hour" | "gender" | "name" | "result";

// ===== Five Element Bar =====
function ElementBar({ element, count, max, color, emoji }: {
  element: string; count: number; max: number; color: string; emoji: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const strength = count >= 3 ? "旺" : count >= 2 ? "中" : "弱";
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7">{emoji}</span>
      <span className="text-amber-200/70 text-sm w-6">{element}</span>
      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-amber-200/50 text-xs w-12 text-right">{count} ({strength})</span>
    </div>
  );
}

// ===== Pillar Card =====
function PillarCard({ label, pillar }: { label: string; pillar: BaziChart["yearPillar"] }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-amber-200/40 mb-2 tracking-wider">{label}</div>
      <div className="bg-white/5 border border-amber-400/10 rounded-xl p-3 space-y-1">
        <div className="text-2xl font-bold text-amber-300">{pillar.stem}</div>
        <div className="text-xs text-amber-200/40">{pillar.stemElement}</div>
        <div className="w-8 h-px bg-amber-400/20 mx-auto" />
        <div className="text-2xl font-bold text-amber-100">{pillar.branch}</div>
        <div className="text-xs text-amber-200/40">{pillar.branchElement}</div>
      </div>
      <div className="text-[10px] text-amber-200/30 mt-1">{pillar.animal}</div>
    </div>
  );
}

// ===== AI Reading Card =====
function ReadingCard({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="bg-white/5 border border-amber-400/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="text-amber-300 font-semibold">{title}</h3>
      </div>
      <p className="text-amber-100/70 text-sm leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

export default function FortunePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12101c]" />}>
      <FortuneContent />
    </Suspense>
  );
}

function FortuneContent() {
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>("select");
  const [step, setStep] = useState<Step>("date");

  // BaZi inputs
  const [birthDate, setBirthDate] = useState("");
  const [hourBranch, setHourBranch] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [userName, setUserName] = useState("");

  // Results
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [aiReading, setAiReading] = useState<Record<string, string> | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const searchParams = useSearchParams();

  // Auto-fill from URL query parameter (from homepage quick entry)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setBirthDate(dateParam);
      setMode("bazi");
      setStep("hour");
    }
  }, [searchParams]);

  // Restore state from sessionStorage (chart + payment status)
  useEffect(() => {
    // Restore chart
    const saved = sessionStorage.getItem("trustmaster_chart");
    const savedName = sessionStorage.getItem("trustmaster_userName");
    const wasPaid = sessionStorage.getItem("trustmaster_paid") === "true";

    if (saved && !chart) {
      try {
        const restoredChart = JSON.parse(saved);
        setChart(restoredChart);
        if (savedName) setUserName(savedName);
        setMode("bazi");
        setStep("result");
        if (wasPaid) {
          setUnlocked(true);
          setShowPaywall(false);
        }
      } catch { /* ignore */ }
    }

    // Check if returning from Stripe payment
    const paid = searchParams.get("paid");
    const sessionId = searchParams.get("session_id");
    if (paid === "true" && sessionId) {
      fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.paid) {
            setUnlocked(true);
            setShowPaywall(false);
            sessionStorage.setItem("trustmaster_paid", "true");
            // Restore chart and trigger AI reading
            if (saved) {
              try {
                const c = JSON.parse(saved);
                setChart(c);
                setMode("bazi");
                setStep("result");
                // Trigger AI reading after state settles
                setTimeout(() => {
                  handleAiReading();
                }, 500);
              } catch { /* ignore */ }
            }
          }
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStripeCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartId: chart?.solarDate || "", userName }),
      });
      const data = await res.json();
      if (data.url) {
        // Save chart to sessionStorage so it persists after redirect
        if (chart) sessionStorage.setItem("trustmaster_chart", JSON.stringify(chart));
        sessionStorage.setItem("trustmaster_userName", userName);
        window.location.href = data.url;
      }
    } catch {
      setCheckoutLoading(false);
    }
  };

  const handleCalculate = () => {
    if (!birthDate || !hourBranch || !gender) return;
    const [y, m, d] = birthDate.split("-").map(Number);
    const result = calculateBazi(y, m, d, hourBranch, gender as "male" | "female");
    setChart(result);
    setStep("result");
  };

  const handleAiReading = async () => {
    if (!chart || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/bazi-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart }),
      });
      const data = await res.json();
      setAiReading(data);
    } catch {
      setAiReading({ error: "解读失败，请重试" });
    }
    setAiLoading(false);
  };

  const reset = () => {
    setMode("select");
    setStep("date");
    setBirthDate("");
    setHourBranch("");
    setGender("");
    setChart(null);
    setAiReading(null);
  };

  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    if (!chart || pdfLoading) return;
    setPdfLoading(true);
    try {
      const { generateBaziPDF } = await import("@/lib/generate-pdf");
      await generateBaziPDF(chart, aiReading, userName);
    } catch (e) {
      console.error("PDF export failed:", e);
    }
    setPdfLoading(false);
  };

  const goBack = () => {
    if (step === "date") reset();
    else if (step === "hour") setStep("date");
    else if (step === "gender") setStep("hour");
    else if (step === "name") setStep("gender");
    else if (step === "result") { setChart(null); setAiReading(null); setStep("name"); }
  };

  const progressIndex = ["date", "hour", "gender", "name"].indexOf(step);

  // ===== Mode Selection =====
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-[#12101c]">
        <header className="flex items-center justify-between px-4 lg:px-12 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className="text-lg font-bold text-amber-200/80">TrustMaster</span>
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-sm text-amber-200/40">{t("horoscope.title")}</span>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12 lg:py-20 pb-24">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-amber-400/30" />
              <span className="text-amber-400/40 text-[10px] tracking-[0.3em] uppercase">Ancient Eastern Wisdom</span>
              <div className="w-8 h-px bg-amber-400/30" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gradient-gold">探索命运的奥秘</h1>
            <p className="text-amber-200/40 mt-3 text-sm">选择您想要的个性化分析方式</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => { setMode("bazi"); setStep("date"); }}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-amber-400/10 hover:border-amber-400/20 rounded-2xl p-6 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">☯</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 transition-colors">八字命理</h2>
                  <p className="text-amber-200/40 text-sm mt-1 leading-relaxed">源自 3000 年中国古老智慧的四柱分析系统，通过出生时刻生成个性化人生蓝图，AI 深度解读</p>
                  <div className="flex items-center gap-2 mt-3 text-amber-400/30 text-xs">
                    <span>Four Pillars 四柱</span><span>·</span><span>Five Elements 五行</span><span>·</span><span>AI Reading</span>
                  </div>
                </div>
                <span className="text-amber-400/20 group-hover:text-amber-400/40 text-xl transition-colors">→</span>
              </div>
            </button>

            <Link
              href="/daily"
              className="block w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-amber-400/10 hover:border-amber-400/20 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📅</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 transition-colors">每日运势</h2>
                  <p className="text-amber-200/40 text-sm mt-1 leading-relaxed">基于您的八字日主，每天个性化的四维运势评分、宜忌指南、幸运指引</p>
                  <div className="flex items-center gap-2 mt-3 text-amber-400/30 text-xs">
                    <span>Daily Score</span><span>·</span><span>今日宜忌</span><span>·</span><span>幸运指引</span>
                  </div>
                </div>
                <span className="text-amber-400/20 group-hover:text-amber-400/40 text-xl transition-colors">→</span>
              </div>
            </Link>

            <Link
              href="/fortune/zodiac"
              className="block w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-amber-400/10 hover:border-amber-400/20 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">♈</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 transition-colors">星座运势</h2>
                  <p className="text-amber-200/40 text-sm mt-1 leading-relaxed">西洋占星每日运势，AI 生成个性化的爱情、事业、财运、健康分析</p>
                  <div className="flex items-center gap-2 mt-3 text-amber-400/30 text-xs">
                    <span>12 Zodiac Signs</span><span>·</span><span>Daily Reading</span><span>·</span><span>AI Powered</span>
                  </div>
                </div>
                <span className="text-amber-400/20 group-hover:text-amber-400/40 text-xl transition-colors">→</span>
              </div>
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ===== BaZi Flow =====
  return (
    <div className="min-h-screen bg-[#12101c]">
      <header className="flex items-center justify-between px-4 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="text-amber-200/60 hover:text-amber-200 text-lg cursor-pointer">←</button>
          <span className="text-sm text-amber-200/60">八字命理</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 lg:py-16 pb-24">
        {/* ===== Step 1: Date ===== */}
        {step === "date" && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <div className="text-5xl mb-6">📅</div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">请选择出生日期</h2>
            <p className="text-amber-200/40 text-sm mb-10">公历（阳历）日期，我们将精确转换为农历</p>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className="w-full max-w-xs mx-auto bg-white/5 border border-amber-400/20 rounded-xl px-4 py-3.5 text-amber-100 text-center text-lg focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
            />
            <button
              onClick={() => birthDate && setStep("hour")}
              disabled={!birthDate}
              className="mt-10 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              下一步
            </button>
          </div>
        )}

        {/* ===== Step 2: Hour ===== */}
        {step === "hour" && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <div className="text-5xl mb-6">🕐</div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">请选择出生时辰</h2>
            <p className="text-amber-200/40 text-sm mb-8">时辰决定八字中的时柱，影响内在性格与子女运</p>
            <div className="grid grid-cols-3 gap-2.5">
              {CHINESE_HOURS.map((h) => (
                <button
                  key={h.branch}
                  onClick={() => setHourBranch(h.branch)}
                  className={`p-3 rounded-xl text-center cursor-pointer transition-all border ${
                    hourBranch === h.branch
                      ? "bg-amber-700/30 border-amber-500/40 text-amber-200"
                      : "bg-white/[0.03] border-white/5 text-amber-200/50 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="text-base font-bold">{h.name}</div>
                  <div className="text-[10px] mt-0.5 opacity-50">{h.label}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => { if (!hourBranch) setHourBranch("午"); setStep("gender"); }}
              className="mt-4 text-amber-200/30 text-xs hover:text-amber-200/50 cursor-pointer transition-colors"
            >
              不确定时辰？点击跳过
            </button>
            <button
              onClick={() => hourBranch && setStep("gender")}
              disabled={!hourBranch}
              className="mt-6 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              下一步
            </button>
          </div>
        )}

        {/* ===== Step 3: Gender ===== */}
        {step === "gender" && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <div className="text-5xl mb-6">⚤</div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">请选择性别</h2>
            <p className="text-amber-200/40 text-sm mb-10">性别影响大运流转方向</p>
            <div className="flex gap-4 max-w-xs mx-auto">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-6 rounded-2xl text-center cursor-pointer transition-all border ${
                    gender === g ? "bg-amber-700/30 border-amber-500/40" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="text-3xl mb-2">{g === "male" ? "♂" : "♀"}</div>
                  <div className={`font-semibold ${gender === g ? "text-amber-200" : "text-amber-200/50"}`}>
                    {g === "male" ? "男" : "女"}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => gender && setStep("name")}
              disabled={!gender}
              className="mt-10 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              下一步
            </button>
          </div>
        )}

        {/* ===== Step 4: Name ===== */}
        {step === "name" && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all w-6 ${i <= 3 ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <div className="text-5xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">请输入您的姓名</h2>
            <p className="text-amber-200/40 text-sm mb-10">姓名将显示在个性化分析报告中（可选）</p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full max-w-xs mx-auto bg-white/5 border border-amber-400/20 rounded-xl px-4 py-3.5 text-amber-100 text-center text-lg placeholder:text-amber-200/20 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
            />
            <button
              onClick={() => { if (!userName.trim()) setUserName("缘主"); handleCalculate(); }}
              className="mt-4 text-amber-200/30 text-xs hover:text-amber-200/50 cursor-pointer transition-colors"
            >
              跳过，直接生成命盘
            </button>
            <button
              onClick={handleCalculate}
              disabled={!userName.trim()}
              className="mt-6 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              生成命盘
            </button>
          </div>
        )}

        {/* ===== Step 5: Result ===== */}
        {step === "result" && chart && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-400/30 text-xs mb-4">
                <span>☸</span><span>四柱八字命盘</span><span>☸</span>
              </div>
              {userName && <h2 className="text-xl font-bold text-amber-100 mb-1">{userName}</h2>}
              <p className="text-amber-200/60 text-sm">{chart.solarDate}</p>
              <p className="text-amber-200/40 text-xs mt-1">{chart.lunarDate} · {chart.birthHour}</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-sm text-amber-200/40">{chart.zodiacEmoji} {chart.zodiacAnimal}</span>
                <span className="text-amber-400/20">·</span>
                <span className="text-sm text-amber-200/40">{chart.westernZodiacSymbol} {chart.westernZodiac}</span>
              </div>
            </div>

            {/* ① Four Pillars — Enhanced */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">
                <Term k="四柱">四 柱 八 字</Term>
              </h3>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { label: "年柱", pillar: chart.yearPillar, tenGod: chart.tenGods.year, nayin: chart.nayin.year, termKey: "年柱" },
                  { label: "月柱", pillar: chart.monthPillar, tenGod: chart.tenGods.month, nayin: chart.nayin.month, termKey: "月柱" },
                  { label: "日柱", pillar: chart.dayPillar, tenGod: "日主", nayin: chart.nayin.day, termKey: "日柱" },
                  { label: "时柱", pillar: chart.hourPillar, tenGod: chart.tenGods.hour, nayin: chart.nayin.hour, termKey: "时柱" },
                ].map(({ label, pillar, tenGod, nayin, termKey }) => (
                  <div key={label} className="text-center">
                    <div className="text-[10px] text-amber-200/40 mb-1"><Term k={termKey}>{label}</Term></div>
                    <div className="text-[9px] text-amber-500/50 mb-1"><Term k={tenGod === "日主" ? "日主" : tenGod}>{tenGod}</Term></div>
                    <div className="bg-white/5 border border-amber-400/10 rounded-xl p-2.5 space-y-0.5">
                      <div className="text-xl font-bold text-amber-300">{pillar.stem}</div>
                      <div className="text-[10px] text-amber-200/30">{pillar.stemElement}</div>
                      <div className="w-6 h-px bg-amber-400/15 mx-auto" />
                      <div className="text-xl font-bold text-amber-100">{pillar.branch}</div>
                      <div className="text-[10px] text-amber-200/30">{pillar.branchElement}</div>
                    </div>
                    <div className="text-[9px] text-amber-200/25 mt-1">{pillar.animal}</div>
                    {nayin && <div className="text-[9px] text-amber-400/30 mt-0.5"><Term k="纳音">{nayin}</Term></div>}
                  </div>
                ))}
              </div>

              {/* Hidden Stems Row */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-center text-[10px] text-amber-400/30 mb-2"><Term k="藏干">藏干</Term></div>
                <div className="grid grid-cols-4 gap-2.5 text-center">
                  {[chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar].map((p, i) => (
                    <div key={i} className="text-[11px] text-amber-200/40">
                      {p.hiddenStems.map((s, j) => (
                        <span key={j}>
                          {j > 0 && " "}
                          <span className="text-amber-200/60">{s}</span>
                          <span className="text-[9px] text-amber-200/20">{STEM_ELEMENTS[s]}</span>
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ② Day Master Analysis */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">
                <Term k="日主">日 主 分 析</Term>
              </h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-300">{chart.dayMaster}</div>
                  <div className="text-xs text-amber-200/40 mt-1">{chart.dayMasterElement}命</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: chart.dayMasterStrength === "strong" ? "#22c55e" : "#f59e0b" }}>
                    <Term k={chart.dayMasterStrength === "strong" ? "身强" : "身弱"}>
                      {chart.dayMasterStrength === "strong" ? "身 强" : "身 弱"}
                    </Term>
                  </div>
                  {/* Strength meter */}
                  <div className="w-24 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${chart.dayMasterScore}%`, backgroundColor: chart.dayMasterStrength === "strong" ? "#22c55e" : "#f59e0b" }}
                    />
                  </div>
                  <div className="text-[10px] text-amber-200/30 mt-1">{chart.dayMasterScore}/100</div>
                </div>
              </div>
              <p className="text-amber-100/60 text-xs leading-relaxed text-center">{chart.dayMasterDesc}</p>
            </div>

            {/* ③ Five Elements */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">
                <Term k="五行相生">五 行 分 布</Term>
              </h3>
              <div className="space-y-2.5">
                {(["木", "火", "土", "金", "水"] as const).map((el) => (
                  <ElementBar
                    key={el}
                    element={el}
                    count={chart.fiveElements[el]}
                    max={Math.max(...Object.values(chart.fiveElements))}
                    color={chart.elementColors[el]}
                    emoji={chart.elementEmoji[el]}
                  />
                ))}
              </div>
              {/* Generation cycle visual */}
              <div className="mt-4 pt-3 border-t border-white/5 text-center">
                <div className="text-[10px] text-amber-200/25 mb-2">五行相生相克</div>
                <div className="text-xs text-amber-200/40 leading-loose">
                  🌳→🔥→⛰️→⚙️→💧→🌳 <span className="text-amber-200/20 ml-2">（相生）</span>
                </div>
              </div>
            </div>

            {/* ④ Key Indicators */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">命 盘 要 素</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                  <div className="text-[10px] text-amber-200/30 mb-1"><Term k="喜用神">喜用神</Term></div>
                  <div className="text-lg font-bold" style={{ color: chart.elementColors[chart.luckyElement] }}>
                    {chart.elementEmoji[chart.luckyElement]} {chart.luckyElement}
                  </div>
                  <div className="text-[10px] text-amber-200/25 mt-1">宜多亲近</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                  <div className="text-[10px] text-amber-200/30 mb-1">忌神</div>
                  <div className="text-lg font-bold text-red-400/70">
                    {chart.elementEmoji[chart.unluckyElement]} {chart.unluckyElement}
                  </div>
                  <div className="text-[10px] text-amber-200/25 mt-1">宜少接触</div>
                </div>
              </div>
            </div>

            {/* ⑤ Lucky Element Recommendations */}
            {ELEMENT_RECOMMENDATIONS[chart.luckyElement] && (
              <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
                <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">开 运 指 南</h3>
                {(() => {
                  const rec = ELEMENT_RECOMMENDATIONS[chart.luckyElement];
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                        <div className="text-[10px] text-amber-400/40 mb-1">🎨 幸运色</div>
                        <div className="text-xs text-amber-100/60">{rec.colors}</div>
                      </div>
                      <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                        <div className="text-[10px] text-amber-400/40 mb-1">🧭 方位</div>
                        <div className="text-xs text-amber-100/60">{rec.directions}</div>
                      </div>
                      <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                        <div className="text-[10px] text-amber-400/40 mb-1">🔢 幸运数字</div>
                        <div className="text-xs text-amber-100/60">{rec.numbers}</div>
                      </div>
                      <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                        <div className="text-[10px] text-amber-400/40 mb-1">💼 宜从事行业</div>
                        <div className="text-xs text-amber-100/60">{rec.industries}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ⑥ Current Year Influence */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">
                <Term k="流年">{new Date().getFullYear()} 流 年 简 析</Term>
              </h3>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg text-amber-300">{chart.currentYearStem}{chart.currentYearBranch}</span>
                  {chart.currentYearNayin && <span className="text-xs text-amber-200/40"><Term k="纳音">{chart.currentYearNayin}</Term></span>}
                </div>
                <p className="text-xs text-amber-100/50 leading-relaxed">
                  流年天干 <span className="text-amber-300">{chart.currentYearStem}</span>（{STEM_ELEMENTS[chart.currentYearStem]}）
                  对日主 <span className="text-amber-300">{chart.dayMaster}</span>（{chart.dayMasterElement}）为
                  <span className="text-amber-300 font-bold"> {getTenGod(chart.dayMaster, chart.currentYearStem)}</span>，
                  {(() => {
                    const god = getTenGod(chart.dayMaster, chart.currentYearStem);
                    if (["正财", "偏财"].includes(god)) return "今年财运活跃，宜把握机会。";
                    if (["正官", "七杀"].includes(god)) return "今年事业压力与机遇并存，宜谨慎行事。";
                    if (["正印", "偏印"].includes(god)) return "今年有贵人相助，适合学习进修。";
                    if (["食神", "伤官"].includes(god)) return "今年才华展现，适合创作和表达。";
                    return "今年运势平稳，宜稳中求进。";
                  })()}
                </p>
              </div>
            </div>

            {/* AI Deep Reading — Paywall or Content */}
            {!unlocked && !aiReading ? (
              <>
                {/* Blurred preview to tease content */}
                <div className="relative">
                  <div className="space-y-4 blur-sm pointer-events-none select-none">
                    <ReadingCard icon="🧠" title="性格特质" content="基于您的日主甲木和八字组合，您天生具有坚韧不拔的品质，如同参天大树般扎根深处。您的思维敏捷，善于规划..." />
                    <ReadingCard icon="💼" title="事业运势" content="2026年流年丙午，火势旺盛。对于您的八字组合而言，今年适合积极拓展事业版图，尤其在创意和管理领域..." />
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12101c] via-[#12101c]/80 to-transparent" />
                </div>

                {/* Unlock CTA */}
                <div className="relative -mt-20 pt-12">
                  {!showPaywall ? (
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="w-full py-4 rounded-2xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_40px_rgba(217,119,6,0.25)] transition-all"
                    >
                      🔓 解锁 AI 深度解读
                    </button>
                  ) : (
                    /* Paywall Modal */
                    <div className="bg-white/[0.03] border border-amber-400/15 rounded-2xl p-6 space-y-5">
                      <div className="text-center">
                        <div className="text-3xl mb-3">✨</div>
                        <h3 className="text-xl font-bold text-amber-100">解锁完整个性化分析报告</h3>
                        <p className="text-amber-200/40 text-sm mt-2">
                          基于您的真实八字，AI 大师将为您深度解读 6 大维度
                        </p>
                      </div>

                      {/* What you get */}
                      <div className="space-y-2">
                        {[
                          { icon: "🧠", text: "性格特质深度分析" },
                          { icon: "💼", text: "事业运势与发展方向" },
                          { icon: "💰", text: "财运分析与投资建议" },
                          { icon: "❤️", text: "感情运势与桃花分析" },
                          { icon: "🏥", text: "健康提醒与养生建议" },
                          { icon: "🍀", text: "开运指南（颜色/方位/行业）" },
                        ].map((item) => (
                          <div key={item.text} className="flex items-center gap-2.5 text-sm text-amber-200/60">
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                            <span className="ml-auto text-amber-500/40">✓</span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-amber-200/30 line-through text-sm">$19.99</span>
                          <span className="text-3xl font-bold text-amber-300">$9.99</span>
                        </div>
                        <p className="text-amber-200/30 text-xs mt-1">Launch special · One-time purchase · Instant delivery</p>
                      </div>

                      {/* Payment Button — Real Stripe Checkout */}
                      <div className="space-y-2.5">
                        <button
                          onClick={handleStripeCheckout}
                          disabled={checkoutLoading}
                          className="w-full py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all text-sm disabled:opacity-50"
                        >
                          {checkoutLoading ? "Redirecting to checkout..." : "💳 Pay $9.99 — Unlock Full Personality Analysis"}
                        </button>
                        <p className="text-center text-amber-200/15 text-[10px] leading-relaxed">
                          Secure payment via Stripe · Visa / Mastercard / Apple Pay / Google Pay / Alipay
                        </p>
                      </div>

                      {/* Compliance notices */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <p className="text-amber-200/20 text-[10px] leading-relaxed text-center">
                          Digital product · Delivered instantly · Non-refundable after delivery
                        </p>
                        <p className="text-amber-200/20 text-[10px] leading-relaxed text-center">
                          By purchasing you agree to our <a href="/terms" className="underline hover:text-amber-200/40">Terms of Service</a> and <a href="/privacy" className="underline hover:text-amber-200/40">Privacy Policy</a>
                        </p>
                        <p className="text-amber-200/15 text-[10px] text-center">
                          This is an AI-powered personality analysis for entertainment purposes only.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowPaywall(false)}
                        className="w-full text-center text-amber-200/20 text-xs hover:text-amber-200/40 cursor-pointer transition-colors"
                      >
                        暂不需要
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : aiLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-4xl mb-3">🔮</div>
                <p className="text-amber-200/50 text-sm">AI 大师正在解读您的命盘...</p>
                <p className="text-amber-200/20 text-xs mt-1">基于真实八字数据，约需 5-10 秒</p>
              </div>
            ) : aiReading?.error ? (
              <div className="text-center py-4">
                <p className="text-red-400/70 text-sm mb-3">{aiReading.error}</p>
                <button onClick={handleAiReading} className="text-amber-200/50 text-xs hover:text-amber-200 cursor-pointer">重试</button>
              </div>
            ) : aiReading ? (
              <div className="space-y-4">
                <div className="text-center text-xs text-amber-400/40 tracking-widest">✨ AI 深度解读</div>
                {aiReading.personality && <ReadingCard icon="🧠" title="性格特质" content={aiReading.personality} />}
                {aiReading.career && <ReadingCard icon="💼" title="事业运势" content={aiReading.career} />}
                {aiReading.wealth && <ReadingCard icon="💰" title="财运分析" content={aiReading.wealth} />}
                {aiReading.love && <ReadingCard icon="❤️" title="感情运势" content={aiReading.love} />}
                {aiReading.health && <ReadingCard icon="🏥" title="健康提醒" content={aiReading.health} />}
                {aiReading.advice && <ReadingCard icon="🍀" title="开运指南" content={aiReading.advice} />}
              </div>
            ) : null}

            {/* PDF Export — only after payment */}
            {unlocked && (
              <button
                onClick={handleExportPDF}
                disabled={pdfLoading}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm cursor-pointer bg-white/5 hover:bg-white/10 text-amber-200/70 border border-amber-400/15 transition-all disabled:opacity-50"
              >
                {pdfLoading ? "正在生成 PDF..." : "📄 导出个性化分析报告 PDF"}
              </button>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={reset} className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5">
                重新测算
              </button>
              <Link href="/" className="flex-1 py-3 rounded-xl text-sm font-medium text-center bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5">
                咨询大师
              </Link>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
