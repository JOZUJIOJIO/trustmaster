"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { calculateBazi, CHINESE_HOURS, type BaziChart, getTenGod, STEM_ELEMENTS } from "@/lib/bazi";
import { ELEMENT_RECOMMENDATIONS } from "@/lib/bazi-glossary";
import { Term } from "@/components/Tooltip";
import RadarChart from "@/components/RadarChart";
import Accordion from "@/components/Accordion";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BaziReveal from "@/components/BaziReveal";
import FiveElementsCircle from "@/components/FiveElementsCircle";
import TenGodChart from "@/components/TenGodChart";
import LuckCurve from "@/components/LuckCurve";
import { EnhancedReadingCard } from "@/components/AiReadingVisual";
import ChineseHourDial from "@/components/ChineseHourDial";
import YinYangSelector from "@/components/YinYangSelector";
import CelestialDatePicker from "@/components/CelestialDatePicker";
import MysticalNameInput from "@/components/MysticalNameInput";
import { generateBlueprint } from "@/lib/bazi-interpreter";

type Mode = "select" | "bazi" | "zodiac";
type Step = "date" | "hour" | "gender" | "name" | "reveal" | "result";

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

// ===== AI Reading Card — Upgraded =====
function ReadingCard({ icon, title, content, delay = 0 }: { icon: string; title: string; content: string; delay?: number }) {
  return (
    <div
      className="relative bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5 overflow-hidden group hover:border-amber-400/20 transition-all duration-500"
      style={{ animation: `slideUp 0.6s ease-out ${delay}ms both` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-amber-300 font-semibold">{title}</h3>
        </div>
        <p className="text-amber-100/70 text-sm leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}

// ===== Section wrapper with scroll reveal =====
function RevealSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ===== Strength Gauge (circular) =====
function StrengthGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" className="transform -rotate-90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="45" cy="45" r={r} fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 90, height: 90 }}>
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-amber-200/30">/100</span>
      </div>
      <span className="text-xs text-amber-200/50 mt-1">{label}</span>
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
  const { locale, t } = useLocale();
  const isChinese = locale === "zh" || locale === "th";
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
            if (saved) {
              try {
                const c = JSON.parse(saved);
                setChart(c);
                setMode("bazi");
                setStep("result");
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
    setStep("reveal"); // Go to reveal animation instead of result
    try {
      sessionStorage.setItem("trustmaster_chart", JSON.stringify(result));
      sessionStorage.setItem("trustmaster_userName", userName);
      localStorage.setItem("trustmaster_saved_chart", JSON.stringify({ chart: result, userName, date: new Date().toISOString() }));
    } catch { /* ignore */ }
  };

  const handleRevealComplete = useCallback(() => {
    setStep("result");
  }, []);

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

  const [shareLoading, setShareLoading] = useState(false);
  const handleShareCard = async () => {
    if (!chart || shareLoading) return;
    setShareLoading(true);
    try {
      const { generateShareCard } = await import("@/lib/generate-share-card");
      await generateShareCard(chart, userName);
    } catch (e) {
      console.error("Share card failed:", e);
    }
    setShareLoading(false);
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

  // ===== Reveal Animation =====
  if (step === "reveal" && chart) {
    return (
      <BaziReveal
        chart={chart}
        userName={userName}
        onComplete={handleRevealComplete}
      />
    );
  }

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
            <h1 className="text-3xl lg:text-4xl font-bold text-gradient-gold">{t("bazi.exploreTitle")}</h1>
            <p className="text-amber-200/40 mt-3 text-sm">{t("bazi.selectMethod")}</p>
          </div>

          <div className="space-y-4">
            {/* Saved chart — welcome back */}
            {(() => {
              try {
                const saved = typeof window !== "undefined" ? localStorage.getItem("trustmaster_saved_chart") : null;
                if (saved) {
                  const { chart: savedChart, userName: savedName } = JSON.parse(saved);
                  if (savedChart?.dayMaster) {
                    return (
                      <button
                        onClick={() => { setChart(savedChart); setUserName(savedName || ""); setMode("bazi"); setStep("result"); }}
                        className="w-full text-left bg-amber-700/10 hover:bg-amber-700/15 border border-amber-500/20 hover:border-amber-500/30 rounded-2xl p-5 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">👋</div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-amber-200">{isChinese ? "欢迎回来" : "Welcome Back"}{savedName ? `，${savedName}` : ""}</div>
                            <div className="text-xs text-amber-200/40 mt-0.5">
                              {savedChart.dayMaster}{savedChart.dayMasterElement}{isChinese ? "命" : ""} · {savedChart.zodiacEmoji} {savedChart.zodiacAnimal} · {isChinese ? "查看上次的命盘" : "View your saved chart"}
                            </div>
                          </div>
                          <span className="text-amber-400/30 group-hover:text-amber-400/50 text-lg">→</span>
                        </div>
                      </button>
                    );
                  }
                }
              } catch { /* ignore */ }
              return null;
            })()}

            <button
              onClick={() => { setMode("bazi"); setStep("date"); }}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-amber-400/10 hover:border-amber-400/20 rounded-2xl p-6 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">☯</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 transition-colors">{t("bazi.title")}</h2>
                  <p className="text-amber-200/40 text-sm mt-1 leading-relaxed">{t("bazi.baziDesc")}</p>
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
                  <h2 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 transition-colors">{t("bazi.dailyTitle")}</h2>
                  <p className="text-amber-200/40 text-sm mt-1 leading-relaxed">{t("bazi.dailyDesc")}</p>
                </div>
                <span className="text-amber-400/20 group-hover:text-amber-400/40 text-xl transition-colors">→</span>
              </div>
            </Link>

            <Link
              href="/compatibility"
              className="block w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-purple-400/10 hover:border-purple-400/20 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">💑</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-purple-200 group-hover:text-purple-100 transition-colors">{t("bazi.compatTitle")}</h2>
                  <p className="text-purple-200/40 text-sm mt-1 leading-relaxed">{t("bazi.compatDesc")}</p>
                </div>
                <span className="text-purple-400/20 group-hover:text-purple-400/40 text-xl transition-colors">→</span>
              </div>
            </Link>

            <Link
              href="/fortune/zodiac"
              className="block w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-amber-400/10 hover:border-amber-400/20 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">♈</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 transition-colors">{t("bazi.zodiacTitle")}</h2>
                  <p className="text-amber-200/40 text-sm mt-1 leading-relaxed">{t("bazi.zodiacDesc")}</p>
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
          <span className="text-sm text-amber-200/60">{t("bazi.title")}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 lg:py-16 pb-24">
        {/* ===== Step 1: Date ===== */}
        {step === "date" && (
          <div className="text-center animate-fadeIn" style={{ animationDuration: "0.5s" }}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectDate")}</h2>
            <p className="text-amber-200/40 text-sm mb-6">{t("bazi.dateHint")}</p>
            <CelestialDatePicker value={birthDate} onChange={setBirthDate} />
            <button
              onClick={() => birthDate && setStep("hour")}
              disabled={!birthDate}
              className="mt-10 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              {t("bazi.next")}
            </button>
          </div>
        )}

        {/* ===== Step 2: Hour ===== */}
        {step === "hour" && (
          <div className="text-center animate-fadeIn" style={{ animationDuration: "0.5s" }}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectHour")}</h2>
            <p className="text-amber-200/40 text-sm mb-4">{t("bazi.hourHint")}</p>
            <ChineseHourDial value={hourBranch} onChange={setHourBranch} isChinese={isChinese} />
            <button
              onClick={() => { if (!hourBranch) setHourBranch("午"); setStep("gender"); }}
              className="mt-4 text-amber-200/30 text-xs hover:text-amber-200/50 cursor-pointer transition-colors"
            >
              {t("bazi.skipHour")}
            </button>
            <button
              onClick={() => hourBranch && setStep("gender")}
              disabled={!hourBranch}
              className="mt-6 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              {t("bazi.next")}
            </button>
          </div>
        )}

        {/* ===== Step 3: Gender ===== */}
        {step === "gender" && (
          <div className="text-center animate-fadeIn" style={{ animationDuration: "0.5s" }}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectGender")}</h2>
            <p className="text-amber-200/40 text-sm mb-4">{t("bazi.genderHint")}</p>
            <YinYangSelector value={gender} onChange={setGender} isChinese={isChinese} />
            <button
              onClick={() => gender && setStep("name")}
              disabled={!gender}
              className="mt-10 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              {t("bazi.next")}
            </button>
          </div>
        )}

        {/* ===== Step 4: Name ===== */}
        {step === "name" && (
          <div className="text-center animate-fadeIn" style={{ animationDuration: "0.5s" }}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= 3 ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.enterName")}</h2>
            <p className="text-amber-200/40 text-sm mb-8">{t("bazi.nameHint")}</p>
            <MysticalNameInput value={userName} onChange={setUserName} placeholder={t("bazi.namePlaceholder")} />
            <button
              onClick={() => { if (!userName.trim()) setUserName("缘主"); handleCalculate(); }}
              className="mt-4 text-amber-200/30 text-xs hover:text-amber-200/50 cursor-pointer transition-colors"
            >
              {t("bazi.skipName")}
            </button>
            <button
              onClick={handleCalculate}
              disabled={!userName.trim()}
              className="mt-6 w-full max-w-xs mx-auto block px-8 py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              {t("bazi.generate")}
            </button>
          </div>
        )}

        {/* ===== Step 5: Result ===== */}
        {step === "result" && chart && (
          <div className="space-y-6">
            {/* Header */}
            <RevealSection delay={0}>
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
            </RevealSection>

            {/* ① Four Pillars */}
            <RevealSection delay={100}>
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
                      <div className="bg-white/5 border border-amber-400/10 rounded-xl p-2.5 space-y-0.5 hover:border-amber-400/20 transition-colors">
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

                {/* Hidden Stems */}
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
            </RevealSection>

            {/* ② Day Master — Circular Gauge */}
            <RevealSection delay={200}>
              <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
                <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">
                  <Term k="日主">日 主 分 析</Term>
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-300">{chart.dayMaster}</div>
                    <div className="text-sm text-amber-200/40 mt-1">{chart.dayMasterElement}命</div>
                  </div>
                  <div className="relative">
                    <StrengthGauge
                      score={chart.dayMasterScore}
                      label={chart.dayMasterStrength === "strong" ? "身强" : "身弱"}
                      color={chart.dayMasterStrength === "strong" ? "#22c55e" : "#f59e0b"}
                    />
                  </div>
                </div>
                <p className="text-amber-100/60 text-xs leading-relaxed text-center mt-4">{chart.dayMasterDesc}</p>
              </div>
            </RevealSection>

            {/* ③ Five Elements — Interactive Circle + Bars */}
            <RevealSection delay={300}>
              <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
                <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-2">
                  <Term k="五行相生">五 行 生 克 关 系</Term>
                </h3>
                <FiveElementsCircle
                  fiveElements={chart.fiveElements}
                  dayMasterElement={chart.dayMasterElement}
                  luckyElement={chart.luckyElement}
                  unluckyElement={chart.unluckyElement}
                />
                {/* Compact bar summary */}
                <div className="space-y-1.5 mt-4 pt-4 border-t border-white/5">
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
              </div>
            </RevealSection>

            {/* ④ Ten Gods Power Distribution */}
            <RevealSection delay={400}>
              <Accordion title={isChinese ? "十 神 力 量 分 布" : "TEN GODS DISTRIBUTION"} icon="🎭" defaultOpen={true}>
                <TenGodChart chart={chart} />
              </Accordion>
            </RevealSection>

            {/* ⑤ Key Indicators */}
            <RevealSection delay={500}>
              <Accordion title={isChinese ? "命 盘 要 素" : "KEY INDICATORS"} icon="🎯" defaultOpen={true}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5 hover:border-green-500/20 transition-colors">
                    <div className="text-[10px] text-amber-200/30 mb-1"><Term k="喜用神">喜用神</Term></div>
                    <div className="text-lg font-bold" style={{ color: chart.elementColors[chart.luckyElement] }}>
                      {chart.elementEmoji[chart.luckyElement]} {chart.luckyElement}
                    </div>
                    <div className="text-[10px] text-amber-200/25 mt-1">宜多亲近</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5 hover:border-red-500/20 transition-colors">
                    <div className="text-[10px] text-amber-200/30 mb-1">忌神</div>
                    <div className="text-lg font-bold text-red-400/70">
                      {chart.elementEmoji[chart.unluckyElement]} {chart.unluckyElement}
                    </div>
                    <div className="text-[10px] text-amber-200/25 mt-1">宜少接触</div>
                  </div>
                </div>
              </Accordion>
            </RevealSection>

            {/* ⑥ Lucky Guidance */}
            <RevealSection delay={600}>
              {ELEMENT_RECOMMENDATIONS[chart.luckyElement] && (
                <Accordion title={isChinese ? "开 运 指 南" : "LUCKY GUIDANCE"} icon="🍀" defaultOpen={true}>
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
                </Accordion>
              )}
            </RevealSection>

            {/* ⑦ Current Year */}
            <RevealSection delay={700}>
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
            </RevealSection>

            {/* ⑧ Luck Curve — SVG Life Trend */}
            <RevealSection delay={800}>
              {chart.luckCycles && chart.luckCycles.length > 0 && (
                <Accordion title={isChinese ? "人 生 运 势 曲 线" : "LIFE LUCK CURVE"} icon="📈" defaultOpen={true}>
                  <LuckCurve chart={chart} />
                </Accordion>
              )}
            </RevealSection>

            {/* ⑨ Personality Blueprint */}
            <RevealSection delay={900}>
              <Accordion title={isChinese ? "性 格 蓝 图" : "PERSONALITY BLUEPRINT"} icon="🧠" defaultOpen={false}>
                {(() => {
                  const bp = generateBlueprint(chart);
                  return (
                    <div className="space-y-3">
                      {[
                        { icon: "🧠", title: "核心性格", content: bp.personality },
                        { icon: "💼", title: "事业方向", content: bp.career },
                        { icon: "❤️", title: "感情模式", content: bp.love },
                        { icon: "🏥", title: "健康指引", content: bp.health },
                      ].map((item) => (
                        <div key={item.title} className="bg-white/[0.02] rounded-xl p-4 border border-white/5 hover:border-amber-400/10 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{item.icon}</span>
                            <span className="text-sm font-semibold text-amber-200/80">{item.title}</span>
                          </div>
                          <p className="text-xs text-amber-100/50 leading-relaxed whitespace-pre-line">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Accordion>
            </RevealSection>

            {/* ⑩ Historical Verification */}
            <RevealSection delay={1000}>
              <Accordion title={isChinese ? "回 顾 验 证" : "HISTORICAL VERIFICATION"} icon="🔍" defaultOpen={false}>
                <p className="text-center text-amber-200/30 text-[10px] mb-3">{isChinese ? "以下分析基于您的大运周期，请对照自身经历验证准确性" : "Compare the following with your real life experiences to verify accuracy"}</p>
                <div className="space-y-2.5">
                  {[
                    {
                      period: "2020-2022",
                      question: chart.dayMasterElement === "木" || chart.dayMasterElement === "火"
                        ? "这几年你是否经历了事业或生活方向的重大调整？"
                        : chart.dayMasterElement === "土"
                        ? "这几年你是否在房产、家庭方面有重要变化？"
                        : chart.dayMasterElement === "金"
                        ? "这几年你是否在工作或人际关系上经历了较大压力？"
                        : "这几年你是否有搬迁、旅行或学习新领域的经历？",
                    },
                    {
                      period: "2023-2024",
                      question: getTenGod(chart.dayMaster, chart.currentYearStem).includes("财")
                        ? "最近两年你的收入或理财方式是否有明显变化？"
                        : getTenGod(chart.dayMaster, chart.currentYearStem).includes("官")
                        ? "最近两年你的职位或社会角色是否有所转变？"
                        : "最近两年你是否感受到个人成长或思维方式的转变？",
                    },
                  ].map((item) => (
                    <div key={item.period} className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-amber-400/50 text-xs font-mono">{item.period}</span>
                      </div>
                      <p className="text-xs text-amber-100/50 leading-relaxed">{item.question}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-amber-200/20 text-[10px] mt-3">{isChinese ? "如果以上分析与您的经历吻合，说明命盘分析准确度较高" : "If the above matches your experience, the chart analysis has high accuracy"}</p>
              </Accordion>
            </RevealSection>

            {/* AI Deep Reading — Paywall or Content */}
            <RevealSection delay={1100}>
              {!unlocked && !aiReading ? (
                <>
                  {/* Blurred preview with sweep effect */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="space-y-4 blur-sm pointer-events-none select-none">
                      <ReadingCard icon="🧠" title="性格特质" content="基于您的日主甲木和八字组合，您天生具有坚韧不拔的品质，如同参天大树般扎根深处。您的思维敏捷，善于规划..." />
                      <ReadingCard icon="💼" title="事业运势" content="2026年流年丙午，火势旺盛。对于您的八字组合而言，今年适合积极拓展事业版图，尤其在创意和管理领域..." />
                    </div>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12101c] via-[#12101c]/80 to-transparent" />
                    {/* Sweep light effect */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(217,169,106,0.06) 50%, transparent 60%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 4s linear infinite",
                      }}
                    />
                  </div>

                  {/* Unlock CTA */}
                  <div className="relative -mt-20 pt-12">
                    {!showPaywall ? (
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="w-full py-4 rounded-2xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_40px_rgba(217,119,6,0.25)] transition-all animate-glowPulse"
                      >
                        {t("bazi.unlock")}
                      </button>
                    ) : (
                      /* Paywall Modal */
                      <div className="bg-white/[0.03] border border-amber-400/15 rounded-2xl p-6 space-y-5 animate-slideUp" style={{ animationDuration: "0.4s" }}>
                        <div className="text-center">
                          <div className="text-3xl mb-3">✨</div>
                          <h3 className="text-xl font-bold text-amber-100">{t("bazi.unlockTitle")}</h3>
                          <p className="text-amber-200/40 text-sm mt-2">
                            基于您的真实八字，AI 大师将为您深度解读 6 大维度
                          </p>
                        </div>

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

                        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-amber-200/30 line-through text-sm">$19.99</span>
                            <span className="text-3xl font-bold text-amber-300">$9.99</span>
                          </div>
                          <p className="text-amber-200/30 text-xs mt-1">Launch special · One-time purchase · Instant delivery</p>
                        </div>

                        <div className="space-y-2.5">
                          <button
                            onClick={handleStripeCheckout}
                            disabled={checkoutLoading}
                            className="w-full py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all text-sm disabled:opacity-50 animate-borderGlow"
                          >
                            {checkoutLoading ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
                                <span className="ml-1">跳转支付中</span>
                              </span>
                            ) : "💳 Pay $9.99 — Unlock Full Personality Analysis"}
                          </button>
                          <p className="text-center text-amber-200/15 text-[10px] leading-relaxed">
                            Secure payment via Stripe · Visa / Mastercard / Apple Pay / Google Pay / Alipay
                          </p>
                        </div>

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
                <div className="text-center py-12">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-400/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400/60 animate-spin" />
                    <div className="absolute inset-2 rounded-full border border-transparent border-b-amber-400/30 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">🔮</span>
                  </div>
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
                  <div className="text-center text-xs text-amber-400/40 tracking-widest">✨ AI 深度解读 × 数据可视化</div>
                  {aiReading.personality && <EnhancedReadingCard icon="🧠" title="性格特质" content={aiReading.personality} chart={chart} dimension="personality" delay={0} />}
                  {aiReading.career && <EnhancedReadingCard icon="💼" title="事业运势" content={aiReading.career} chart={chart} dimension="career" delay={100} />}
                  {aiReading.wealth && <EnhancedReadingCard icon="💰" title="财运分析" content={aiReading.wealth} chart={chart} dimension="wealth" delay={200} />}
                  {aiReading.love && <EnhancedReadingCard icon="❤️" title="感情运势" content={aiReading.love} chart={chart} dimension="love" delay={300} />}
                  {aiReading.health && <EnhancedReadingCard icon="🏥" title="健康提醒" content={aiReading.health} chart={chart} dimension="health" delay={400} />}
                  {aiReading.advice && <EnhancedReadingCard icon="🍀" title="开运指南" content={aiReading.advice} chart={chart} dimension="advice" delay={500} />}
                </div>
              ) : null}
            </RevealSection>

            {/* Action Buttons */}
            <RevealSection delay={1200}>
              <div className="space-y-3">
                {/* PDF Export — only after payment */}
                {unlocked && (
                  <button
                    onClick={handleExportPDF}
                    disabled={pdfLoading}
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm cursor-pointer bg-white/5 hover:bg-white/10 text-amber-200/70 border border-amber-400/15 transition-all disabled:opacity-50"
                  >
                    {pdfLoading ? "..." : t("bazi.exportPdf")}
                  </button>
                )}

                {/* Share Card */}
                <button
                  onClick={handleShareCard}
                  disabled={shareLoading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm cursor-pointer bg-gradient-to-r from-purple-800/50 via-purple-700/50 to-purple-800/50 hover:from-purple-700/50 hover:via-purple-600/50 hover:to-purple-700/50 text-purple-200/80 border border-purple-400/15 transition-all disabled:opacity-50"
                >
                  {shareLoading ? "..." : t("bazi.shareCard")}
                </button>

                <div className="flex gap-3 pt-2">
                  <button onClick={reset} className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5">
                    {t("bazi.reset")}
                  </button>
                  <Link href="/" className="flex-1 py-3 rounded-xl text-sm font-medium text-center bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5">
                    {t("bazi.consultMaster")}
                  </Link>
                </div>
              </div>
            </RevealSection>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
