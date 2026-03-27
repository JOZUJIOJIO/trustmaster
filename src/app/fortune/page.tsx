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
import { useAuth } from "@/lib/supabase/auth-context";
import { useToast } from "@/components/Toast";

// Generate a stable hash for a chart to use as cache/order key
function getChartHash(chart: BaziChart): string {
  return [
    chart.yearPillar.stem, chart.yearPillar.branch,
    chart.monthPillar.stem, chart.monthPillar.branch,
    chart.dayPillar.stem, chart.dayPillar.branch,
    chart.hourPillar.stem, chart.hourPillar.branch,
    chart.gender,
  ].join("-");
}

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
  const { locale, isChinese, t } = useLocale();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("select");
  const [step, setStep] = useState<Step>("date");
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const [freeReadings, setFreeReadings] = useState(0);

  // Check subscription status + free readings when user logs in
  useEffect(() => {
    if (!user) { setIsSubscriber(false); return; }

    // Track referral if this is a new user with a ref code
    const refCode = localStorage.getItem("kairos_ref");
    if (refCode) {
      fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: refCode, newUserId: user.id }),
      }).then(() => localStorage.removeItem("kairos_ref")).catch(() => {});
    }

    // Check subscription
    fetch("/api/subscription/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.subscribed) {
          setIsSubscriber(true);
          setUnlocked(true);
          setShowPaywall(false);
        }
      })
      .catch(() => {});

    // Check free readings from referrals
    fetch(`/api/referral?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.freeReadings > 0) {
          setFreeReadings(data.freeReadings);
        }
      })
      .catch(() => {});
  }, [user]);

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
    // Store referral code from URL
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("kairos_ref", ref);
    }
  }, [searchParams]);

  // Restore state from storage (chart + payment status)
  useEffect(() => {
    // Try sessionStorage first, then localStorage for persistence across tabs
    const saved = sessionStorage.getItem("kairos_chart")
      || localStorage.getItem("kairos_chart");
    const savedName = sessionStorage.getItem("kairos_userName")
      || localStorage.getItem("kairos_userName");
    const wasPaid = sessionStorage.getItem("kairos_paid") === "true";

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
            toast(isChinese ? "支付成功！AI 大师正在为您解读..." : "Payment successful! AI reading starting...", "success");
            // Persist payment status to both storages
            sessionStorage.setItem("kairos_paid", "true");
            localStorage.setItem("kairos_order_session", sessionId);
            // Convert referral if this user was referred
            if (user) {
              fetch("/api/referral", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ referredUserId: user.id }),
              }).catch(() => {});
            }
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

  const [checkoutError, setCheckoutError] = useState("");

  // Dynamic day master personality snippets for blurred preview
  const previewPersonality: Record<string, { zh: string; en: string }> = {
    "甲": { zh: "基于您的日主甲木和八字组合，您天生如同参天大树，正直向上，有领袖气质。您的思维敏捷，善于规划...", en: "Based on your Day Master Jia Wood, you are like a towering tree — upright, ambitious, with natural leadership..." },
    "乙": { zh: "基于您的日主乙木和八字组合，您外柔内刚，如同藤蔓般善于借力攀升。您的适应力极强，温和中藏着韧性...", en: "Based on your Day Master Yi Wood, you are like a vine — flexible yet resilient, adapting and climbing with quiet strength..." },
    "丙": { zh: "基于您的日主丙火和八字组合，您天生光明磊落，如同太阳般热情奔放。您的感染力极强，走到哪里都是焦点...", en: "Based on your Day Master Bing Fire, you radiate warmth like the sun — passionate, generous, and naturally magnetic..." },
    "丁": { zh: "基于您的日主丁火和八字组合，您温暖内敛，如同烛光般照亮身边人。您的洞察力极强，能看穿表象...", en: "Based on your Day Master Ding Fire, you are like candlelight — warm, perceptive, illuminating truth in darkness..." },
    "戊": { zh: "基于您的日主戊土和八字组合，您厚重可靠，如同高山般沉稳。您是团队中的定海神针，让人安心...", en: "Based on your Day Master Wu Earth, you are like a mountain — steady, reliable, the anchor everyone depends on..." },
    "己": { zh: "基于您的日主己土和八字组合，您温润如田园沃土，善于滋养和培育他人。您的包容力极强...", en: "Based on your Day Master Ji Earth, you are like fertile soil — nurturing, inclusive, growing everything around you..." },
    "庚": { zh: "基于您的日主庚金和八字组合，您果决刚毅，如同刀剑般锋利。您重义气，做事雷厉风行...", en: "Based on your Day Master Geng Metal, you are like a blade — decisive, principled, cutting through confusion..." },
    "辛": { zh: "基于您的日主辛金和八字组合，您精致高雅，如同珠宝般内敛清贵。您追求完美，品味独到...", en: "Based on your Day Master Xin Metal, you are like a gemstone — refined, elegant, with exquisite taste..." },
    "壬": { zh: "基于您的日主壬水和八字组合，您智慧深沉，如同江河般胸怀宽广。您志向远大，思维不受束缚...", en: "Based on your Day Master Ren Water, you are like a river — deep, wise, flowing toward grand ambitions..." },
    "癸": { zh: "基于您的日主癸水和八字组合，您至柔至弱却能润泽万物，如同雨露。您的直觉极强，感应力敏锐...", en: "Based on your Day Master Gui Water, you are like morning dew — gentle yet penetrating, with powerful intuition..." },
  };

  const handleSubscribe = async (plan: "monthly" | "yearly" = "monthly") => {
    if (!user) { setShowLoginGate(true); return; }
    setSubLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email, plan }),
      });
      const data = await res.json();
      if (data.url) {
        if (chart) {
          const chartJson = JSON.stringify(chart);
          sessionStorage.setItem("kairos_chart", chartJson);
          localStorage.setItem("kairos_chart", chartJson);
        }
        window.location.href = data.url;
      }
    } catch { /* ignore */ }
    setSubLoading(false);
  };

  const handleStripeCheckout = async (tier: "pro" | "master" = "pro") => {
    if (!user) { setShowLoginGate(true); return; }
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chartId: chart?.solarDate || "",
          chartHash: chart ? getChartHash(chart) : "",
          userName,
          userId: user.id,
          tier,
        }),
      });
      const data = await res.json();
      if (data.url) {
        // Persist to both storages before redirecting to Stripe
        if (chart) {
          const chartJson = JSON.stringify(chart);
          sessionStorage.setItem("kairos_chart", chartJson);
          localStorage.setItem("kairos_chart", chartJson);
        }
        sessionStorage.setItem("kairos_userName", userName);
        localStorage.setItem("kairos_userName", userName);
        window.location.href = data.url;
      } else {
        const errMsg = data.error || (isChinese ? "无法创建支付链接，请稍后重试" : "Failed to create payment link. Please try again.");
        setCheckoutError(errMsg);
        toast(errMsg, "error");
        setCheckoutLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const errMsg = isChinese ? "网络错误，请检查连接后重试" : "Network error. Please check your connection.";
      setCheckoutError(errMsg);
      toast(errMsg, "error");
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
      const chartJson = JSON.stringify(result);
      sessionStorage.setItem("kairos_chart", chartJson);
      sessionStorage.setItem("kairos_userName", userName);
      // Also persist to localStorage for cross-session durability
      localStorage.setItem("kairos_chart", chartJson);
      localStorage.setItem("kairos_userName", userName);
      localStorage.setItem("kairos_saved_chart", JSON.stringify({ chart: result, userName, date: new Date().toISOString() }));
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
      if (res.status === 401) {
        toast(isChinese ? "请先登录" : "Please log in first", "error");
        setAiLoading(false);
        return;
      }
      if (res.status === 402) {
        setShowPaywall(true);
        setAiLoading(false);
        return;
      }
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
              <span className="text-lg font-bold text-amber-200/80">Kairós</span>
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-sm text-amber-200/40">{t("horoscope.title")}</span>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="max-w-2xl lg:max-w-5xl mx-auto px-4 py-12 lg:py-20 pb-24">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-amber-400/30" />
              <span className="text-amber-400/40 text-[10px] tracking-[0.3em] uppercase">Ancient Eastern Wisdom</span>
              <div className="w-8 h-px bg-amber-400/30" />
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-gradient-gold">{t("bazi.exploreTitle")}</h1>
            <p className="text-amber-200/40 mt-3 text-sm">{t("bazi.selectMethod")}</p>
          </div>

          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
            {/* Saved chart — welcome back */}
            {(() => {
              try {
                const saved = typeof window !== "undefined" ? localStorage.getItem("kairos_saved_chart") : null;
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

      <main className="max-w-lg lg:max-w-4xl mx-auto px-4 py-8 lg:py-16 pb-24">
        {/* ===== Step 1: Date ===== */}
        {step === "date" && (
          <div className="text-center animate-fadeIn" style={{ animationDuration: "0.5s" }}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <h2 className="font-display text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectDate")}</h2>
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
            <h2 className="font-display text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectHour")}</h2>
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
            <h2 className="font-display text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectGender")}</h2>
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
            <h2 className="font-display text-2xl font-bold text-amber-100 mb-2">{t("bazi.enterName")}</h2>
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
            {/* Header — full width */}
            <RevealSection delay={0}>
              <div className="text-center lg:mb-4">
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

            {/* Desktop 2-column grid for chart sections */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">

            {/* ① Four Pillars — full width on desktop */}
            <RevealSection delay={100} className="lg:col-span-2">
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
                        <div className="font-chinese text-xl font-bold text-amber-300">{pillar.stem}</div>
                        <div className="text-[10px] text-amber-200/30">{pillar.stemElement}</div>
                        <div className="w-6 h-px bg-amber-400/15 mx-auto" />
                        <div className="font-chinese text-xl font-bold text-amber-100">{pillar.branch}</div>
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
                    <div className="font-chinese text-4xl font-bold text-amber-300">{chart.dayMaster}</div>
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

            {/* ⑧ Luck Curve — SVG Life Trend (full width) */}
            <RevealSection delay={800} className="lg:col-span-2">
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

            </div>{/* End desktop 2-column grid */}

            {/* AI Deep Reading — Paywall or Content (full width) */}
            <RevealSection delay={1100}>
              {!unlocked && !aiReading ? (
                <>
                  {/* Free basic personality reading from deterministic blueprint */}
                  {chart && (() => {
                    const bp = generateBlueprint(chart);
                    return bp.personality ? (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300/80 border border-emerald-400/20 font-semibold tracking-wide">
                            {isChinese ? "免费 · 基础解读" : "FREE · Basic Reading"}
                          </span>
                        </div>
                        <ReadingCard icon="🧠" title={isChinese ? "性格特质" : "Personality"} content={bp.personality} />
                      </div>
                    ) : null;
                  })()}

                  {/* Blurred AI deep reading preview with sweep effect */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="space-y-4 blur-sm pointer-events-none select-none">
                      <ReadingCard icon="🧠" title={isChinese ? "性格特质" : "Personality"} content={chart ? (isChinese ? (previewPersonality[chart.dayMaster]?.zh || "...") : (previewPersonality[chart.dayMaster]?.en || "...")) : "..."} />
                      <ReadingCard icon="💼" title={isChinese ? "事业运势" : "Career"} content={isChinese ? `${chart?.currentYearStem || ""}${chart?.currentYearBranch || ""}年流年运势分析，结合您的十神格局，今年的事业发展方向将呈现新的机遇...` : `${chart?.currentYearStem || ""}${chart?.currentYearBranch || ""} year career analysis based on your Ten Gods pattern reveals new opportunities...`} />
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
                    {/* Login Gate Modal */}
                    {showLoginGate && !user && (
                      <div className="bg-white/[0.03] border border-amber-400/15 rounded-2xl p-6 space-y-4 animate-slideUp mb-4" style={{ animationDuration: "0.4s" }}>
                        <div className="text-center">
                          <div className="text-3xl mb-2">👤</div>
                          <h3 className="text-lg font-bold text-amber-100">
                            {isChinese ? "请先登录" : "Sign in to continue"}
                          </h3>
                          <p className="text-amber-200/40 text-sm mt-1">
                            {isChinese ? "登录后解锁购买，并永久保存您的解读报告" : "Sign in to purchase and permanently save your reading"}
                          </p>
                        </div>
                        <a
                          href={`/login?redirect=${encodeURIComponent("/fortune?paid=pending")}`}
                          className="block w-full py-3 rounded-xl font-semibold text-sm text-center bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
                        >
                          {isChinese ? "登录 / 注册" : "Log In / Sign Up"}
                        </a>
                        <button
                          onClick={() => setShowLoginGate(false)}
                          className="w-full text-center text-amber-200/20 text-xs hover:text-amber-200/40 cursor-pointer transition-colors"
                        >
                          {isChinese ? "暂不登录" : "Skip for now"}
                        </button>
                      </div>
                    )}

                    {!showPaywall ? (
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="w-full py-4 rounded-2xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_40px_rgba(217,119,6,0.25)] transition-all animate-glowPulse"
                      >
                        {t("bazi.unlock")}
                      </button>
                    ) : (
                      /* Paywall Modal */
                      <div className="bg-white/[0.03] border border-amber-400/15 rounded-2xl p-5 space-y-4 animate-slideUp max-h-[calc(100vh-160px)] overflow-y-auto" style={{ animationDuration: "0.4s" }}>
                        <div className="text-center">
                          <div className="text-2xl mb-2">✨</div>
                          <h3 className="text-xl font-bold text-amber-100">{t("bazi.unlockTitle")}</h3>
                          <p className="text-amber-200/40 text-sm mt-2">
                            {isChinese ? "基于您的真实八字，AI 大师将为您深度解读 6 大维度" : "AI will deeply analyze 6 dimensions based on your real birth chart"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {[
                            { icon: "🧠", text: isChinese ? "性格特质深度分析" : "Deep personality analysis" },
                            { icon: "💼", text: isChinese ? "事业运势与发展方向" : "Career & development" },
                            { icon: "💰", text: isChinese ? "财运分析与投资建议" : "Wealth & investment" },
                            { icon: "❤️", text: isChinese ? "感情运势与桃花分析" : "Love & relationships" },
                            { icon: "🏥", text: isChinese ? "健康提醒与养生建议" : "Health guidance" },
                            { icon: "🍀", text: isChinese ? "开运指南（颜色/方位/行业）" : "Lucky guidance" },
                          ].map((item) => (
                            <div key={item.text} className="flex items-center gap-2.5 text-sm text-amber-200/60">
                              <span>{item.icon}</span>
                              <span>{item.text}</span>
                              <span className="ml-auto text-amber-500/40">✓</span>
                            </div>
                          ))}
                        </div>

                        {/* Free reading from referral rewards */}
                        {user && freeReadings > 0 && (
                          <button
                            onClick={() => {
                              setUnlocked(true);
                              setShowPaywall(false);
                              setFreeReadings((prev) => prev - 1);
                              // Deduct on server
                              fetch("/api/referral?userId=" + user.id).catch(() => {});
                              handleAiReading();
                            }}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm cursor-pointer bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white hover:shadow-[0_0_30px_rgba(217,119,6,0.3)] transition-all"
                          >
                            🎁 {isChinese ? `使用免费解读（剩余 ${freeReadings} 次）` : `Use free reading (${freeReadings} left)`}
                          </button>
                        )}

                        {/* Subscription Option — Best Value */}
                        <div className="bg-emerald-900/15 border border-emerald-400/25 rounded-xl p-4 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-emerald-500/80 text-white text-[8px] px-2 py-0.5 rounded-bl-lg font-bold">
                            {isChinese ? "最划算" : "BEST VALUE"}
                          </div>
                          <div className="text-[10px] text-emerald-300/60 mb-1">♾️ {isChinese ? "Pro 会员" : "Pro Membership"}</div>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-2xl font-bold text-emerald-200">$4.99</span>
                            <span className="text-emerald-200/40 text-xs">/{isChinese ? "月" : "mo"}</span>
                          </div>
                          <p className="text-emerald-200/25 text-[10px] mt-1 mb-3">
                            {isChinese ? "无限 AI 解读 · 每日深度运势 · 优先支持" : "Unlimited readings · Daily insights · Priority support"}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleSubscribe("monthly")}
                              disabled={subLoading}
                              className="py-3 rounded-lg font-semibold cursor-pointer bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white text-xs disabled:opacity-50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
                            >
                              {subLoading ? "..." : (isChinese ? "$4.99/月" : "$4.99/mo")}
                            </button>
                            <button
                              onClick={() => handleSubscribe("yearly")}
                              disabled={subLoading}
                              className="py-3 rounded-lg font-semibold cursor-pointer bg-emerald-800/50 text-emerald-200 text-xs border border-emerald-500/20 disabled:opacity-50 hover:bg-emerald-700/50 transition-all"
                            >
                              {subLoading ? "..." : (isChinese ? "$39.90/年 省33%" : "$39.90/yr save 33%")}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-white/5" />
                          <span className="text-amber-200/20 text-[10px]">{isChinese ? "或单次购买" : "or one-time purchase"}</span>
                          <div className="flex-1 h-px bg-white/5" />
                        </div>

                        {/* Two-tier one-time pricing */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Pro */}
                          <div className="bg-amber-900/15 border border-amber-500/20 rounded-xl p-3.5 text-center">
                            <div className="text-[10px] text-amber-400/50 mb-1">⭐ {isChinese ? "专业版" : "Pro"}</div>
                            <div className="text-2xl font-bold text-amber-300">$9.90</div>
                            <p className="text-amber-200/25 text-[10px] mt-1 mb-3">{isChinese ? "6维AI深度解读" : "6-dimension AI reading"}</p>
                            <button
                              onClick={() => handleStripeCheckout("pro")}
                              disabled={checkoutLoading}
                              className="w-full py-3 rounded-lg font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white text-xs disabled:opacity-50 hover:shadow-[0_0_20px_rgba(217,119,6,0.2)] transition-all"
                            >
                              {checkoutLoading ? "..." : (isChinese ? "选择专业版" : "Choose Pro")}
                            </button>
                          </div>
                          {/* Master */}
                          <div className="bg-purple-900/15 border border-purple-400/25 rounded-xl p-3.5 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-purple-500/80 text-white text-[8px] px-2 py-0.5 rounded-bl-lg font-bold">{isChinese ? "推荐" : "BEST"}</div>
                            <div className="text-[10px] text-purple-300/60 mb-1">👑 {isChinese ? "大师版" : "Master"}</div>
                            <div className="text-2xl font-bold text-purple-200">$29.90</div>
                            <p className="text-purple-200/25 text-[10px] mt-1 mb-3">{isChinese ? "宗师级全盘深度解析" : "Master-level deep reading"}</p>
                            <button
                              onClick={() => handleStripeCheckout("master")}
                              disabled={checkoutLoading}
                              className="w-full py-3 rounded-lg font-semibold cursor-pointer bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 text-white text-xs disabled:opacity-50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all"
                            >
                              {checkoutLoading ? "..." : (isChinese ? "选择大师版" : "Choose Master")}
                            </button>
                          </div>
                        </div>

                        {checkoutError && (
                          <p className="text-center text-red-400/80 text-xs">{checkoutError}</p>
                        )}
                        <p className="text-center text-amber-200/15 text-[10px] leading-relaxed">
                          Secure payment via Stripe · Card / Alipay / WeChat Pay
                        </p>

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
                          {isChinese ? "暂不需要" : "Not now"}
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
                  {aiReading.actionItems && (
                    <div className="bg-gradient-to-br from-amber-900/15 via-transparent to-amber-900/10 border border-amber-500/15 rounded-2xl p-5 animate-fadeIn" style={{ animationDelay: "600ms", animationFillMode: "both" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📋</span>
                        <h3 className="text-sm font-bold text-amber-200">{isChinese ? "本月行动清单" : "This Month's Action Plan"}</h3>
                      </div>
                      <div className="space-y-2.5">
                        {aiReading.actionItems.split(/\n|；/).filter((s: string) => s.trim()).map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 bg-white/[0.02] rounded-xl p-3 border border-white/5">
                            <span className="text-amber-400/50 text-xs mt-0.5">▸</span>
                            <p className="text-xs text-amber-100/60 leading-relaxed">{item.trim()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </RevealSection>

            {/* Share prompt — appears after AI reading loads */}
            {aiReading && !aiReading.error && (
              <div className="bg-gradient-to-r from-purple-900/20 via-purple-800/20 to-purple-900/20 border border-purple-400/15 rounded-2xl p-5 text-center space-y-3 animate-slideUp" style={{ animationDuration: "0.6s" }}>
                <div className="text-2xl">✨</div>
                <p className="text-amber-100 text-sm font-semibold">
                  {isChinese ? "您的命盘已生成" : "Your chart is ready"}
                </p>
                <p className="text-amber-200/40 text-xs">
                  {isChinese ? "分享给朋友，看看你们的默契度" : "Share with friends to discover your compatibility"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleShareCard}
                    disabled={shareLoading}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all disabled:opacity-50"
                  >
                    {shareLoading ? "..." : (isChinese ? "生成分享卡片" : "Create Share Card")}
                  </button>
                  <a
                    href={`/compatibility?from=${encodeURIComponent(userName || "")}&date=${chart?.solarDate || ""}`}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/5 text-amber-200/70 border border-amber-400/15 hover:bg-white/10 transition-all"
                  >
                    {isChinese ? "测默契度" : "Check Compatibility"}
                  </a>
                </div>
              </div>
            )}

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
