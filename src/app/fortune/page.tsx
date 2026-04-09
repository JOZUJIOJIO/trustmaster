"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { useTheme } from "@/lib/ThemeContext";
import { themeTokens } from "@/lib/theme-tokens";
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
import { ElementBar } from "@/components/fortune/ElementBar";
import { ReadingCard } from "@/components/fortune/ReadingCard";
import { RevealSection } from "@/components/fortune/RevealSection";
import { StrengthGauge } from "@/components/fortune/StrengthGauge";
import { PaywallSection } from "@/components/fortune/PaywallSection";
import { ShareCard } from "@/components/fortune/ShareCard";

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
type Step = "input" | "date" | "hour" | "gender" | "name" | "reveal" | "result";


export default function FortunePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060410] dark:bg-[#060410]" />}>
      <FortuneContent />
    </Suspense>
  );
}

function FortuneContent() {
  const { locale, isChinese, t } = useLocale();
  const { theme } = useTheme();
  const tk = themeTokens[theme];
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("bazi");
  const [step, setStep] = useState<Step>("input");
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
      // Stay on "input" step — date is pre-filled, user fills the rest
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
      localStorage.setItem("kairos_birth_date", birthDate);
      localStorage.setItem("kairos_gender", gender);
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

  const [accuracyVote, setAccuracyVote] = useState<string | null>(null);
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
    if (step === "input") reset();
    else if (step === "date") reset();
    else if (step === "hour") setStep("input");
    else if (step === "gender") setStep("input");
    else if (step === "name") setStep("input");
    else if (step === "result") { setChart(null); setAiReading(null); setStep("input"); }
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
      <div className={`min-h-screen ${tk.bg}`}>
        <header className={`flex items-center justify-between px-4 lg:px-12 py-4 border-b ${tk.divider}`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className={`text-lg font-bold ${tk.text2}`}>Kairós</span>
            </Link>
            <span className={`${tk.text3}`}>/</span>
            <span className={`text-sm ${tk.text3}`}>{t("horoscope.title")}</span>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="max-w-2xl lg:max-w-5xl mx-auto px-4 py-12 lg:py-20 pb-24">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={`w-8 h-px ${tk.accentMuted.replace("text-", "bg-")}`} />
              <span className={`${tk.accentMuted} text-[10px] tracking-[0.3em] uppercase`}>Ancient Eastern Wisdom</span>
              <div className={`w-8 h-px ${tk.accentMuted.replace("text-", "bg-")}`} />
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-gradient-gold">{t("bazi.exploreTitle")}</h1>
            <p className={`${tk.text3} mt-3 text-sm`}>{t("bazi.selectMethod")}</p>
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
                            <div className={`text-xs ${tk.text3} mt-0.5`}>
                              {savedChart.dayMaster}{savedChart.dayMasterElement}{isChinese ? "命" : ""} · {savedChart.zodiacEmoji} {savedChart.zodiacAnimal} · {isChinese ? "查看上次的命盘" : "View your saved chart"}
                            </div>
                          </div>
                          <span className={`${tk.accentMuted} text-lg`}>→</span>
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
              className={`w-full text-left ${tk.card} rounded-2xl p-6 transition-all duration-300 cursor-pointer group border`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">☯</div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${theme === "cosmic" ? "text-amber-200 group-hover:text-[#F2F0EB]" : "text-amber-700 group-hover:text-[#1a1520]"} transition-colors`}>{t("bazi.title")}</h2>
                  <p className={`${tk.text3} text-sm mt-1 leading-relaxed`}>{t("bazi.baziDesc")}</p>
                  <div className={`flex items-center gap-2 mt-3 ${tk.accentMuted} text-xs`}>
                    <span>Four Pillars 四柱</span><span>·</span><span>Five Elements 五行</span><span>·</span><span>AI Reading</span>
                  </div>
                </div>
                <span className={`${tk.accentMuted} text-xl transition-colors`}>→</span>
              </div>
            </button>

            <Link
              href="/daily"
              className={`block w-full text-left ${tk.card} rounded-2xl p-6 transition-all duration-300 group border`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📅</div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${theme === "cosmic" ? "text-amber-200 group-hover:text-[#F2F0EB]" : "text-amber-700 group-hover:text-[#1a1520]"} transition-colors`}>{t("bazi.dailyTitle")}</h2>
                  <p className={`${tk.text3} text-sm mt-1 leading-relaxed`}>{t("bazi.dailyDesc")}</p>
                </div>
                <span className={`${tk.accentMuted} text-xl transition-colors`}>→</span>
              </div>
            </Link>

            <Link
              href="/compatibility"
              className={`block w-full text-left ${theme === "cosmic" ? "bg-white/[0.03] hover:bg-white/[0.06]" : "bg-white/60 hover:bg-white/80"} border border-purple-400/10 hover:border-purple-400/20 rounded-2xl p-6 transition-all duration-300 group`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">💑</div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${theme === "cosmic" ? "text-purple-200 group-hover:text-purple-100" : "text-purple-700 group-hover:text-purple-900"} transition-colors`}>{t("bazi.compatTitle")}</h2>
                  <p className={`${theme === "cosmic" ? "text-purple-200/40" : "text-purple-700/40"} text-sm mt-1 leading-relaxed`}>{t("bazi.compatDesc")}</p>
                </div>
                <span className="text-purple-400/20 group-hover:text-purple-400/40 text-xl transition-colors">→</span>
              </div>
            </Link>

            <Link
              href="/fortune/zodiac"
              className={`block w-full text-left ${tk.card} rounded-2xl p-6 transition-all duration-300 group border`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">♈</div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${theme === "cosmic" ? "text-amber-200 group-hover:text-[#F2F0EB]" : "text-amber-700 group-hover:text-[#1a1520]"} transition-colors`}>{t("bazi.zodiacTitle")}</h2>
                  <p className={`${tk.text3} text-sm mt-1 leading-relaxed`}>{t("bazi.zodiacDesc")}</p>
                </div>
                <span className={`${tk.accentMuted} text-xl transition-colors`}>→</span>
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
    <div className={`min-h-screen ${tk.bg} relative`}>
      {/* Theme background */}
      {theme === "cosmic" ? (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[#060410]" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(60,20,120,0.12) 0%, transparent 55%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 70% 60%, rgba(140,80,20,0.08) 0%, transparent 50%)" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #E8E6F0 0%, #F2F0EB 40%, #F8F5EE 100%)" }} />
        </div>
      )}
      <header className={`relative z-10 flex items-center justify-between px-4 lg:px-12 py-4 border-b ${tk.divider}`}>
        <div className="flex items-center gap-3">
          <button onClick={goBack} className={`${tk.text3} hover:${tk.text2} text-lg cursor-pointer transition-colors`}>←</button>
          <span className={`text-sm ${tk.text3}`}>{t("bazi.title")}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 max-w-lg lg:max-w-4xl mx-auto px-4 py-8 lg:py-16 pb-24">
        {/* ===== Unified Input ===== */}
        {step === "input" && (
          <div className="text-center animate-fadeIn max-w-md mx-auto" style={{ animationDuration: "0.5s" }}>
            <h2 className={`font-display text-2xl font-bold ${tk.text1} mb-2`}>
              {isChinese ? "输入你的出生信息" : "Enter Your Birth Info"}
            </h2>
            <p className={`${tk.label} text-sm mb-8`}>
              {isChinese ? "只需几秒，即刻生成命盘" : "Takes seconds, instant chart generation"}
            </p>

            <div className="space-y-5 text-left">
              {/* Date */}
              <div>
                <label className={`block text-xs font-medium ${tk.label} mb-1.5`}>
                  {isChinese ? "出生日期" : "Birth Date"} <span className="text-amber-500">*</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  min="1940-01-01"
                  className={`w-full px-4 py-3 rounded-xl ${tk.selectBg} ${tk.input.split(" ").filter(c => c.startsWith("border-") || c.startsWith("text-")).join(" ")} focus:outline-none ${tk.inputFocus} transition-all`}
                  style={{ colorScheme: tk.colorScheme }}
                />
              </div>

              {/* Hour */}
              <div>
                <label className={`block text-xs font-medium ${tk.label} mb-1.5`}>
                  {isChinese ? "出生时辰" : "Birth Hour"}
                  <span className={`${tk.text3} ml-1`}>({isChinese ? "可选" : "optional"})</span>
                </label>
                <select
                  value={hourBranch}
                  onChange={(e) => setHourBranch(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl ${tk.selectBg} ${tk.input.split(" ").filter(c => c.startsWith("border-") || c.startsWith("text-")).join(" ")} focus:outline-none ${tk.inputFocus} transition-all appearance-none cursor-pointer`}
                >
                  <option value="" className={theme === "cosmic" ? "bg-[#12101c]" : "bg-white"}>{isChinese ? "不确定（默认午时）" : "Not sure (default noon)"}</option>
                  {CHINESE_HOURS.map((h) => (
                    <option key={h.branch} value={h.branch} className={theme === "cosmic" ? "bg-[#12101c]" : "bg-white"}>
                      {h.branch} {h.name}（{h.label}）
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className={`block text-xs font-medium ${tk.label} mb-1.5`}>
                  {isChinese ? "性别" : "Gender"} <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGender("male")}
                    className={`py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      gender === "male"
                        ? `${tk.genderActive} border-2`
                        : `${tk.genderInactive} border`
                    }`}
                  >
                    {isChinese ? "♂ 男" : "♂ Male"}
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      gender === "female"
                        ? `${tk.genderActive} border-2`
                        : `${tk.genderInactive} border`
                    }`}
                  >
                    {isChinese ? "♀ 女" : "♀ Female"}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={`block text-xs font-medium ${tk.label} mb-1.5`}>
                  {isChinese ? "姓名" : "Name"}
                  <span className={`${tk.text3} ml-1`}>({isChinese ? "可选" : "optional"})</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={isChinese ? "输入你的名字" : "Your name"}
                  className={`w-full px-4 py-3 rounded-xl ${tk.selectBg} ${tk.input.split(" ").filter(c => c.startsWith("border-") || c.startsWith("text-")).join(" ")} ${theme === "cosmic" ? "placeholder-amber-200/20" : "placeholder-amber-600/20"} focus:outline-none ${tk.inputFocus} transition-all`}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={() => {
                if (!hourBranch) setHourBranch("午");
                if (!userName.trim()) setUserName("缘主");
                if (!gender) setGender("male");
                // Need a small delay to let state update, or compute directly
                const finalHour = hourBranch || "午";
                const finalGender = (gender || "male") as "male" | "female";
                const finalName = userName.trim() || "缘主";
                const [y, m, d] = birthDate.split("-").map(Number);
                const result = calculateBazi(y, m, d, finalHour, finalGender);
                setChart(result);
                setUserName(finalName);
                setHourBranch(finalHour);
                setGender(finalGender);
                setStep("reveal");
                try {
                  const chartJson = JSON.stringify(result);
                  sessionStorage.setItem("kairos_chart", chartJson);
                  sessionStorage.setItem("kairos_userName", finalName);
                  localStorage.setItem("kairos_chart", chartJson);
                  localStorage.setItem("kairos_userName", finalName);
                  localStorage.setItem("kairos_saved_chart", JSON.stringify({ chart: result, userName: finalName, date: new Date().toISOString() }));
                  localStorage.setItem("kairos_birth_date", birthDate);
                  localStorage.setItem("kairos_gender", finalGender);
                } catch { /* ignore */ }
              }}
              disabled={!birthDate}
              className={`mt-8 w-full py-4 rounded-xl font-medium text-base cursor-pointer
                         ${tk.cta}
                         ${theme === "cosmic" ? "hover:bg-amber-400/[0.06] hover:border-amber-400/50" : "hover:bg-amber-600/[0.06] hover:border-amber-600/50"}
                         disabled:opacity-20 disabled:cursor-not-allowed
                         transition-all duration-300 border`}
            >
              {isChinese ? "生成命盘 →" : "Generate Chart →"}
            </button>

            <p className={`${tk.text3} text-[10px] mt-3`}>
              {isChinese ? "只需出生日期即可生成 · 其余可选" : "Only birth date required · rest optional"}
            </p>
          </div>
        )}

        {/* ===== Legacy Step 1: Date (kept for backwards compat) ===== */}
        {step === "date" && (
          <div className="text-center animate-fadeIn" style={{ animationDuration: "0.5s" }}>
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= progressIndex ? "bg-amber-500" : theme === "cosmic" ? "bg-white/10" : "bg-[#1a1520]/10"}`} />
              ))}
            </div>
            <h2 className={`font-display text-2xl font-bold ${tk.text1} mb-2`}>{t("bazi.selectDate")}</h2>
            <p className={`${tk.text3} text-sm mb-6`}>{t("bazi.dateHint")}</p>
            <CelestialDatePicker value={birthDate} onChange={setBirthDate} />
            {birthDate && (
              <div className="mt-4 animate-fadeIn text-center" style={{ animationDuration: "0.4s" }}>
                <p className={`${tk.accentMuted} text-xs`}>
                  {isChinese ? "✨ 出生日期已锁定，命盘轮廓正在浮现..." : "✨ Birth date locked — your chart is taking shape..."}
                </p>
              </div>
            )}
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
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= progressIndex ? "bg-amber-500" : theme === "cosmic" ? "bg-white/10" : "bg-[#1a1520]/10"}`} />
              ))}
            </div>
            <h2 className={`font-display text-2xl font-bold ${tk.text1} mb-2`}>{t("bazi.selectHour")}</h2>
            <p className={`${tk.text3} text-sm mb-4`}>{t("bazi.hourHint")}</p>
            <ChineseHourDial value={hourBranch} onChange={setHourBranch} isChinese={isChinese} />
            {hourBranch && (
              <div className="mt-3 animate-fadeIn text-center" style={{ animationDuration: "0.4s" }}>
                <p className={`${tk.accentMuted} text-xs`}>
                  {isChinese
                    ? `✨ ${CHINESE_HOURS.find(h => h.branch === hourBranch)?.name || ""}时 — 时柱已就位，内心世界即将揭示`
                    : `✨ ${CHINESE_HOURS.find(h => h.branch === hourBranch)?.name || ""} hour — your inner world is forming`}
                </p>
              </div>
            )}
            <button
              onClick={() => { if (!hourBranch) setHourBranch("午"); setStep("gender"); }}
              className={`mt-4 ${tk.text3} text-xs ${tk.label.replace("text-", "hover:text-")} cursor-pointer transition-colors`}
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
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= progressIndex ? "bg-amber-500" : theme === "cosmic" ? "bg-white/10" : "bg-[#1a1520]/10"}`} />
              ))}
            </div>
            <h2 className={`font-display text-2xl font-bold ${tk.text1} mb-2`}>{t("bazi.selectGender")}</h2>
            <p className={`${tk.text3} text-sm mb-4`}>{t("bazi.genderHint")}</p>
            <YinYangSelector value={gender} onChange={setGender} isChinese={isChinese} />
            {gender && (
              <div className="mt-3 animate-fadeIn text-center" style={{ animationDuration: "0.4s" }}>
                <p className={`${tk.accentMuted} text-xs`}>
                  {isChinese
                    ? `✨ ${gender === "male" ? "阳" : "阴"}性能量确认 — 大运流转方向已确定`
                    : `✨ ${gender === "male" ? "Yang" : "Yin"} energy confirmed — destiny cycle direction set`}
                </p>
              </div>
            )}
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
                <div key={i} className={`h-1 rounded-full transition-all duration-500 w-6 ${i <= 3 ? "bg-amber-500" : theme === "cosmic" ? "bg-white/10" : "bg-[#1a1520]/10"}`} />
              ))}
            </div>
            <h2 className={`font-display text-2xl font-bold ${tk.text1} mb-2`}>{t("bazi.enterName")}</h2>
            <p className={`${tk.text3} text-sm mb-8`}>{t("bazi.nameHint")}</p>
            <MysticalNameInput value={userName} onChange={setUserName} placeholder={t("bazi.namePlaceholder")} />
            <button
              onClick={() => { if (!userName.trim()) setUserName("缘主"); handleCalculate(); }}
              className={`mt-4 ${tk.text3} text-xs ${tk.label.replace("text-", "hover:text-")} cursor-pointer transition-colors`}
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
                {/* Dramatic arrival */}
                <div className="text-3xl mb-3 animate-float">🔮</div>
                <p className={`${tk.accent} text-[10px] tracking-[0.3em] mb-4 animate-fadeIn`} style={{ animationDuration: "1s" }}>
                  {isChinese ? "命 盘 已 解 码" : "CHART DECODED"}
                </p>
                {userName && userName !== "缘主" && <h2 className={`text-xl font-bold ${tk.text1} mb-1`}>{userName}</h2>}
                <p className={`${theme === "cosmic" ? "text-amber-200/60" : "text-amber-700/60"} text-sm`}>{chart.solarDate}</p>
                <p className={`${tk.text3} text-xs mt-1`}>{chart.lunarDate} · {chart.birthHour}</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className={`text-sm ${tk.text3}`}>{chart.zodiacEmoji} {chart.zodiacAnimal}</span>
                  <span className={`${tk.accentMuted}`}>·</span>
                  <span className={`text-sm ${tk.text3}`}>{chart.westernZodiacSymbol} {chart.westernZodiac}</span>
                </div>
                {/* Quick summary line */}
                <div className={`mt-4 ${tk.sectionBg} rounded-xl px-4 py-2.5 border ${tk.accentBorder} inline-block`}>
                  <p className={`${tk.label} text-xs`}>
                    {isChinese
                      ? `${chart.dayMaster}${chart.dayMasterElement}命 · ${chart.dayMasterStrength === "strong" ? "身强" : "身弱"} · 喜${chart.luckyElement}`
                      : `${chart.dayMaster} ${chart.dayMasterElement} · ${chart.dayMasterStrength === "strong" ? "Strong" : "Gentle"} · Lucky: ${chart.luckyElement}`}
                  </p>
                </div>
                {/* Share button */}
                <div className="mt-4">
                  <ShareCard chart={chart} userName={userName} isChinese={isChinese} />
                </div>
              </div>
            </RevealSection>

            {/* Section navigation hint */}
            <RevealSection delay={50}>
              <div className={`flex items-center justify-center gap-4 ${tk.text3} text-[10px] py-1`}>
                <span>四柱</span><span>·</span><span>日主</span><span>·</span><span>五行</span><span>·</span><span>十神</span><span>·</span><span>大运</span><span>·</span><span>AI解读</span>
                <span className={`animate-bounce ${tk.accentMuted}`}>↓</span>
              </div>
            </RevealSection>

            {/* Desktop 2-column grid for chart sections */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">

            {/* ① Four Pillars — full width on desktop */}
            <RevealSection delay={100} className="lg:col-span-2">
              <div className={`${tk.card} border rounded-2xl p-5`}>
                <h3 className={`text-center text-xs ${tk.accentMuted} tracking-widest mb-4`}>
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
                      <div className={`text-[10px] ${tk.text3} mb-1`}><Term k={termKey}>{label}</Term></div>
                      <div className={`text-[9px] ${tk.accent} mb-1`}><Term k={tenGod === "日主" ? "日主" : tenGod}>{tenGod}</Term></div>
                      <div className={`${tk.sectionBg} border ${tk.border} rounded-xl p-2.5 space-y-0.5 ${tk.borderHover} transition-colors`}>
                        <div className={`font-chinese text-xl font-bold ${theme === "cosmic" ? "text-amber-300" : "text-amber-700"}`}>{pillar.stem}</div>
                        <div className={`text-[10px] ${tk.text3}`}>{pillar.stemElement}</div>
                        <div className={`w-6 h-px ${theme === "cosmic" ? "bg-amber-400/15" : "bg-amber-600/15"} mx-auto`} />
                        <div className={`font-chinese text-xl font-bold ${tk.text1}`}>{pillar.branch}</div>
                        <div className={`text-[10px] ${tk.text3}`}>{pillar.branchElement}</div>
                      </div>
                      <div className={`text-[9px] ${theme === "cosmic" ? "text-amber-200/25" : "text-amber-700/25"} mt-1`}>{pillar.animal}</div>
                      {nayin && <div className={`text-[9px] ${tk.accentMuted} mt-0.5`}><Term k="纳音">{nayin}</Term></div>}
                    </div>
                  ))}
                </div>

                {/* Hidden Stems */}
                <div className={`mt-3 pt-3 border-t ${tk.divider}`}>
                  <div className={`text-center text-[10px] ${tk.accentMuted} mb-2`}><Term k="藏干">藏干</Term></div>
                  <div className="grid grid-cols-4 gap-2.5 text-center">
                    {[chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar].map((p, i) => (
                      <div key={i} className={`text-[11px] ${tk.text3}`}>
                        {p.hiddenStems.map((s, j) => (
                          <span key={j}>
                            {j > 0 && " "}
                            <span className={`${theme === "cosmic" ? "text-amber-200/60" : "text-amber-700/60"}`}>{s}</span>
                            <span className={`text-[9px] ${tk.text3}`}>{STEM_ELEMENTS[s]}</span>
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
              <div className={`${tk.card} border rounded-2xl p-5`}>
                <h3 className={`text-center text-xs ${tk.accentMuted} tracking-widest mb-4`}>
                  <Term k="日主">日 主 分 析</Term>
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className={`font-chinese text-4xl font-bold ${theme === "cosmic" ? "text-amber-300" : "text-amber-700"}`}>{chart.dayMaster}</div>
                    <div className={`text-sm ${tk.text3} mt-1`}>{chart.dayMasterElement}命</div>
                  </div>
                  <div className="relative">
                    <StrengthGauge
                      score={chart.dayMasterScore}
                      label={chart.dayMasterStrength === "strong" ? "身强" : "身弱"}
                      color={chart.dayMasterStrength === "strong" ? "#22c55e" : "#f59e0b"}
                    />
                  </div>
                </div>
                <p className={`${tk.text2} text-xs leading-relaxed text-center mt-4`}>{chart.dayMasterDesc}</p>
                <p className={`${tk.text3} text-[11px] mt-2 leading-relaxed max-w-xs mx-auto`}>
                  {isChinese
                    ? `日主${chart.dayMasterStrength === "strong" ? "偏强" : "偏弱"}（${chart.dayMasterScore}/100），${
                        chart.dayMasterStrength === "strong"
                          ? "意味着您个性独立、行动力强，适合主导型角色。宜泄宜克，忌过旺。"
                          : "意味着您善于借力、包容力强，适合合作型角色。宜生宜扶，忌过耗。"
                      }`
                    : `Day Master is ${chart.dayMasterStrength} (${chart.dayMasterScore}/100). ${
                        chart.dayMasterStrength === "strong"
                          ? "You're independent with strong initiative — suited for leadership roles."
                          : "You excel at collaboration and adaptability — suited for partnership roles."
                      }`}
                </p>
              </div>
            </RevealSection>

            {/* ③ Five Elements — Interactive Circle + Bars */}
            <RevealSection delay={300}>
              <div className={`${tk.card} border rounded-2xl p-5`}>
                <h3 className={`text-center text-xs ${tk.accentMuted} tracking-widest mb-2`}>
                  <Term k="五行相生">五 行 生 克 关 系</Term>
                </h3>
                <FiveElementsCircle
                  fiveElements={chart.fiveElements}
                  dayMasterElement={chart.dayMasterElement}
                  luckyElement={chart.luckyElement}
                  unluckyElement={chart.unluckyElement}
                />
                {/* Compact bar summary */}
                <div className={`space-y-1.5 mt-4 pt-4 border-t ${tk.divider}`}>
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
                  <div className={`${tk.sectionBg} rounded-xl p-3 text-center border ${tk.border} hover:border-green-500/20 transition-colors`}>
                    <div className={`text-[10px] ${tk.text3} mb-1`}><Term k="喜用神">喜用神</Term></div>
                    <div className="text-lg font-bold" style={{ color: chart.elementColors[chart.luckyElement] }}>
                      {chart.elementEmoji[chart.luckyElement]} {chart.luckyElement}
                    </div>
                    <div className={`text-[10px] ${theme === "cosmic" ? "text-amber-200/25" : "text-amber-700/25"} mt-1`}>宜多亲近</div>
                  </div>
                  <div className={`${tk.sectionBg} rounded-xl p-3 text-center border ${tk.border} hover:border-red-500/20 transition-colors`}>
                    <div className={`text-[10px] ${tk.text3} mb-1`}>忌神</div>
                    <div className="text-lg font-bold text-red-400/70">
                      {chart.elementEmoji[chart.unluckyElement]} {chart.unluckyElement}
                    </div>
                    <div className={`text-[10px] ${theme === "cosmic" ? "text-amber-200/25" : "text-amber-700/25"} mt-1`}>宜少接触</div>
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
                        <div className={`${tk.sectionBg} rounded-lg p-3 border ${tk.border}`}>
                          <div className={`text-[10px] ${tk.accentMuted} mb-1`}>🎨 幸运色</div>
                          <div className={`text-xs ${tk.text2}`}>{rec.colors}</div>
                        </div>
                        <div className={`${tk.sectionBg} rounded-lg p-3 border ${tk.border}`}>
                          <div className={`text-[10px] ${tk.accentMuted} mb-1`}>🧭 方位</div>
                          <div className={`text-xs ${tk.text2}`}>{rec.directions}</div>
                        </div>
                        <div className={`${tk.sectionBg} rounded-lg p-3 border ${tk.border}`}>
                          <div className={`text-[10px] ${tk.accentMuted} mb-1`}>🔢 幸运数字</div>
                          <div className={`text-xs ${tk.text2}`}>{rec.numbers}</div>
                        </div>
                        <div className={`${tk.sectionBg} rounded-lg p-3 border ${tk.border}`}>
                          <div className={`text-[10px] ${tk.accentMuted} mb-1`}>💼 宜从事行业</div>
                          <div className={`text-xs ${tk.text2}`}>{rec.industries}</div>
                        </div>
                      </div>
                    );
                  })()}
                </Accordion>
              )}
            </RevealSection>

            {/* ⑦ Current Year */}
            <RevealSection delay={700}>
              <div className={`${tk.card} border rounded-2xl p-5`}>
                <h3 className={`text-center text-xs ${tk.accentMuted} tracking-widest mb-4`}>
                  <Term k="流年">{new Date().getFullYear()} 流 年 简 析</Term>
                </h3>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-lg ${theme === "cosmic" ? "text-amber-300" : "text-amber-700"}`}>{chart.currentYearStem}{chart.currentYearBranch}</span>
                    {chart.currentYearNayin && <span className={`text-xs ${tk.text3}`}><Term k="纳音">{chart.currentYearNayin}</Term></span>}
                  </div>
                  <p className={`text-xs ${tk.text2} leading-relaxed`}>
                    流年天干 <span className={`${theme === "cosmic" ? "text-amber-300" : "text-amber-700"}`}>{chart.currentYearStem}</span>（{STEM_ELEMENTS[chart.currentYearStem]}）
                    对日主 <span className={`${theme === "cosmic" ? "text-amber-300" : "text-amber-700"}`}>{chart.dayMaster}</span>（{chart.dayMasterElement}）为
                    <span className={`${theme === "cosmic" ? "text-amber-300" : "text-amber-700"} font-bold`}> {getTenGod(chart.dayMaster, chart.currentYearStem)}</span>，
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
                  {/* Luck cycle interpretation */}
                  {chart.luckCycles && chart.luckCycles.length > 0 && (() => {
                    const currentAge = new Date().getFullYear() - parseInt(chart.solarDate);
                    const currentCycle = chart.luckCycles.find(
                      (c: { startAge: number }) => currentAge >= c.startAge && currentAge < c.startAge + 10
                    );
                    if (!currentCycle) return null;
                    const nextCycle = chart.luckCycles.find(
                      (c: { startAge: number }) => c.startAge === currentCycle.startAge + 10
                    );
                    return (
                      <div className={`${tk.sectionBg} rounded-xl p-3.5 border ${tk.border} mt-3`}>
                        <div className={`text-xs font-semibold ${theme === "cosmic" ? "text-amber-200/70" : "text-amber-700/70"} mb-1.5`}>
                          📍 {isChinese ? `当前大运：${currentCycle.stem}${currentCycle.branch}（${currentCycle.element}运 · ${currentCycle.tenGod}）` : `Current Cycle: ${currentCycle.stem}${currentCycle.branch} (${currentCycle.element} · ${currentCycle.tenGod})`}
                        </div>
                        <p className={`text-[11px] ${tk.text2} leading-relaxed`}>
                          {isChinese
                            ? `您正处于${currentCycle.startAge}至${currentCycle.startAge + 10}岁的${currentCycle.element}运阶段，${currentCycle.tenGod}主事。${
                                currentCycle.tenGod.includes("财") ? "此运财星当令，是积累财富、拓展事业的黄金时期。把握投资和合作机会。" :
                                currentCycle.tenGod.includes("官") ? "此运官星当令，适合追求职位晋升、承担更大责任。纪律和自律是成功的关键。" :
                                currentCycle.tenGod.includes("印") ? "此运印星当令，是学习深造、提升自我的最佳时期。多亲近贵人和师长。" :
                                currentCycle.tenGod.includes("食") || currentCycle.tenGod.includes("伤") ? "此运食伤当令，创造力和表达力旺盛。适合创业、创作、发展个人品牌。" :
                                "此运比劫当令，人际关系活跃。适合团队合作，但注意财务管理。"
                              }${nextCycle ? `下一步将进入${nextCycle.element}运（${nextCycle.tenGod}），届时运势方向会有转变。` : ""}`
                            : `You're in the ${currentCycle.element} phase (ages ${currentCycle.startAge}-${currentCycle.startAge + 10}), governed by ${currentCycle.tenGod}. ${
                                currentCycle.tenGod.includes("财") ? "Wealth energy is strong — a golden period for building assets and expanding business." :
                                currentCycle.tenGod.includes("官") ? "Authority energy peaks — ideal for career advancement and taking on greater responsibility." :
                                currentCycle.tenGod.includes("印") ? "Wisdom energy flows — the best period for education, self-improvement, and mentorship." :
                                currentCycle.tenGod.includes("食") || currentCycle.tenGod.includes("伤") ? "Creative energy surges — perfect for entrepreneurship, content creation, and personal branding." :
                                "Social energy is active — great for teamwork, but watch your finances."
                              }${nextCycle ? ` Next phase: ${nextCycle.element} (${nextCycle.tenGod}) — expect a shift in direction.` : ""}`
                          }
                        </p>
                      </div>
                    );
                  })()}
                </Accordion>
              )}
            </RevealSection>

            {/* ⑨ Personality Blueprint */}
            <RevealSection delay={900}>
              <Accordion title={isChinese ? "性 格 蓝 图" : "PERSONALITY BLUEPRINT"} icon="🧠" defaultOpen={true}>
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
                        <div key={item.title} className={`${tk.sectionBg} rounded-xl p-4 border ${tk.border} ${tk.borderHover} transition-colors`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{item.icon}</span>
                            <span className={`text-sm font-semibold ${tk.text2}`}>{item.title}</span>
                          </div>
                          <p className={`text-xs ${tk.text2} leading-relaxed whitespace-pre-line`}>{item.content}</p>
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
                <p className={`text-center ${tk.text3} text-[10px] mb-3`}>{isChinese ? "以下分析基于您的大运周期，请对照自身经历验证准确性" : "Compare the following with your real life experiences to verify accuracy"}</p>
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
                    <div key={item.period} className={`${tk.sectionBg} rounded-xl p-3.5 border ${tk.border}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`${tk.accent} text-xs font-mono`}>{item.period}</span>
                      </div>
                      <p className={`text-xs ${tk.text2} leading-relaxed`}>{item.question}</p>
                    </div>
                  ))}
                </div>
                <p className={`text-center ${tk.text3} text-[10px] mt-3`}>{isChinese ? "如果以上分析与您的经历吻合，说明命盘分析准确度较高" : "If the above matches your experience, the chart analysis has high accuracy"}</p>
                {/* Accuracy feedback */}
                <div className={`mt-4 pt-4 border-t ${tk.divider}`}>
                  <p className={`text-center ${tk.text3} text-xs mb-3`}>{isChinese ? "以上分析符合您的经历吗？" : "Does this match your experience?"}</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setAccuracyVote("accurate");
                        toast(isChinese ? "感谢反馈！您的验证帮助我们提升准确度" : "Thanks! Your feedback helps improve accuracy", "success");
                      }}
                      className={`px-5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${accuracyVote === "accurate" ? "bg-green-600/30 text-green-300 border border-green-400/30" : `${tk.sectionBg} ${tk.label} border ${tk.border} hover:bg-green-900/20 hover:text-green-300`}`}
                    >
                      {isChinese ? "👍 准确" : "👍 Accurate"}
                    </button>
                    <button
                      onClick={() => {
                        setAccuracyVote("partial");
                        toast(isChinese ? "感谢反馈！" : "Thanks for your feedback!", "success");
                      }}
                      className={`px-5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${accuracyVote === "partial" ? "bg-amber-600/30 text-amber-300 border border-amber-400/30" : `${tk.sectionBg} ${tk.label} border ${tk.border} hover:bg-amber-900/20 hover:text-amber-300`}`}
                    >
                      {isChinese ? "🤔 部分准确" : "🤔 Partially"}
                    </button>
                    <button
                      onClick={() => {
                        setAccuracyVote("inaccurate");
                        toast(isChinese ? "感谢反馈！我们会持续优化" : "Thanks! We'll keep improving", "success");
                      }}
                      className={`px-5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${accuracyVote === "inaccurate" ? "bg-red-600/30 text-red-300 border border-red-400/30" : `${tk.sectionBg} ${tk.label} border ${tk.border} hover:bg-red-900/20 hover:text-red-300`}`}
                    >
                      {isChinese ? "👎 不太准" : "👎 Not quite"}
                    </button>
                  </div>
                  {accuracyVote && (
                    <p className={`text-center ${tk.text3} text-[10px] mt-2`}>
                      {isChinese ? "87% 的用户验证了命盘分析的准确性" : "87% of users verified the accuracy of their chart analysis"}
                    </p>
                  )}
                </div>
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
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme === "cosmic" ? "from-[#12101c] via-[#12101c]/80" : "from-[#F5F3EE] via-[#F5F3EE]/80"} to-transparent`} />
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

                  {/* Social proof testimonials */}
                  <div className="relative z-10 -mt-6 mb-2 space-y-2 px-1">
                    {[
                      { text: isChinese ? "AI说我2020年有事业重大调整，确实那年我换了行业。准确度让我惊讶。" : "The AI said I'd have a major career shift in 2020 — I actually changed industries that year. Surprisingly accurate.", name: isChinese ? "用户 M · 深圳" : "User M · Shenzhen", stars: 5 },
                      { text: isChinese ? "性格分析简直像在看自己的镜子，连我的思维模式都说对了。" : "The personality analysis was like looking in a mirror — it even got my thinking patterns right.", name: isChinese ? "用户 K · 曼谷" : "User K · Bangkok", stars: 5 },
                      { text: isChinese ? "给男朋友也测了一下，合盘分析对我们的相处模式描述得很贴切。" : "Tested my boyfriend too — the compatibility analysis described our dynamic perfectly.", name: isChinese ? "用户 L · 新加坡" : "User L · Singapore", stars: 4 },
                    ].map((t, i) => (
                      <div key={i} className={`${tk.sectionBg} rounded-xl p-3 border ${tk.border} flex items-start gap-2.5`}>
                        <span className={`${tk.accentMuted} text-sm mt-0.5`}>💬</span>
                        <div>
                          <p className={`text-[11px] ${tk.text2} leading-relaxed`}>{t.text}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[10px] ${tk.accentMuted}`}>{"⭐".repeat(t.stars)}</span>
                            <span className={`text-[10px] ${theme === "cosmic" ? "text-amber-200/25" : "text-amber-700/25"}`}>— {t.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Unlock CTA */}
                  <PaywallSection
                    user={user}
                    showLoginGate={showLoginGate}
                    showPaywall={showPaywall}
                    setShowPaywall={setShowPaywall}
                    setShowLoginGate={setShowLoginGate}
                    setUnlocked={setUnlocked}
                    setFreeReadings={setFreeReadings}
                    freeReadings={freeReadings}
                    isChinese={isChinese}
                    t={t}
                    handleAiReading={handleAiReading}
                    handleStripeCheckout={handleStripeCheckout}
                    handleSubscribe={handleSubscribe}
                    checkoutLoading={checkoutLoading}
                    subLoading={subLoading}
                    checkoutError={checkoutError}
                  />
                </>
              ) : aiLoading ? (
                <div className="text-center py-12">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className={`absolute inset-0 rounded-full border-2 ${tk.border}`} />
                    <div className={`absolute inset-0 rounded-full border-2 border-transparent ${theme === "cosmic" ? "border-t-amber-400/60" : "border-t-amber-600/60"} animate-spin`} />
                    <div className={`absolute inset-2 rounded-full border border-transparent ${theme === "cosmic" ? "border-b-amber-400/30" : "border-b-amber-600/30"} animate-spin`} style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">🔮</span>
                  </div>
                  <p className={`${tk.label} text-sm`}>AI 大师正在解读您的命盘...</p>
                  <p className={`${tk.text3} text-xs mt-1`}>基于真实八字数据，约需 5-10 秒</p>
                </div>
              ) : aiReading?.error ? (
                <div className="text-center py-4">
                  <p className="text-red-400/70 text-sm mb-3">{aiReading.error}</p>
                  <button onClick={handleAiReading} className={`${tk.label} text-xs ${theme === "cosmic" ? "hover:text-amber-200" : "hover:text-amber-700"} cursor-pointer`}>重试</button>
                </div>
              ) : aiReading ? (
                <div className="space-y-4">
                  <div className={`text-center text-xs ${tk.accentMuted} tracking-widest`}>✨ AI 深度解读 × 数据可视化</div>
                  {aiReading.personality && <EnhancedReadingCard icon="🧠" title="性格特质" content={aiReading.personality} chart={chart} dimension="personality" delay={0} />}
                  {aiReading.career && <EnhancedReadingCard icon="💼" title="事业运势" content={aiReading.career} chart={chart} dimension="career" delay={100} />}
                  {aiReading.wealth && <EnhancedReadingCard icon="💰" title="财运分析" content={aiReading.wealth} chart={chart} dimension="wealth" delay={200} />}
                  {aiReading.love && <EnhancedReadingCard icon="❤️" title="感情运势" content={aiReading.love} chart={chart} dimension="love" delay={300} />}
                  {aiReading.health && <EnhancedReadingCard icon="🏥" title="健康提醒" content={aiReading.health} chart={chart} dimension="health" delay={400} />}
                  {aiReading.advice && <EnhancedReadingCard icon="🍀" title="开运指南" content={aiReading.advice} chart={chart} dimension="advice" delay={500} />}
                  {aiReading.actionItems && (
                    <div className={`${theme === "cosmic" ? "bg-gradient-to-br from-amber-900/15 via-transparent to-amber-900/10 border-amber-500/15" : "bg-gradient-to-br from-amber-100/50 via-transparent to-amber-50/30 border-amber-500/20"} border rounded-2xl p-5 animate-fadeIn`} style={{ animationDelay: "600ms", animationFillMode: "both" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📋</span>
                        <h3 className={`text-sm font-bold ${theme === "cosmic" ? "text-amber-200" : "text-amber-700"}`}>{isChinese ? "本月行动清单" : "This Month's Action Plan"}</h3>
                      </div>
                      <div className="space-y-2.5">
                        {aiReading.actionItems.split(/\n|；/).filter((s: string) => s.trim()).map((item: string, i: number) => (
                          <div key={i} className={`flex items-start gap-2.5 ${tk.sectionBg} rounded-xl p-3 border ${tk.border}`}>
                            <span className={`${tk.accent} text-xs mt-0.5`}>▸</span>
                            <p className={`text-xs ${tk.text2} leading-relaxed`}>{item.trim()}</p>
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
              <div className={`${theme === "cosmic" ? "bg-gradient-to-r from-purple-900/20 via-purple-800/20 to-purple-900/20 border-purple-400/15" : "bg-gradient-to-r from-purple-100/40 via-purple-50/40 to-purple-100/40 border-purple-400/20"} border rounded-2xl p-5 text-center space-y-3 animate-slideUp`} style={{ animationDuration: "0.6s" }}>
                <div className="text-2xl">✨</div>
                <p className={`${tk.text1} text-sm font-semibold`}>
                  {isChinese ? "您的命盘已生成" : "Your chart is ready"}
                </p>
                <p className={`${tk.text3} text-xs`}>
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
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${tk.sectionBg} ${theme === "cosmic" ? "text-amber-200/70 border-amber-400/15 hover:bg-white/10" : "text-amber-700/70 border-amber-600/15 hover:bg-white/80"} border transition-all`}
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
                    className={`w-full py-3.5 rounded-2xl font-semibold text-sm cursor-pointer ${tk.sectionBg} ${theme === "cosmic" ? "hover:bg-white/10 text-amber-200/70 border-amber-400/15" : "hover:bg-white/80 text-amber-700/70 border-amber-600/15"} border transition-all disabled:opacity-50`}
                  >
                    {pdfLoading ? "..." : t("bazi.exportPdf")}
                  </button>
                )}

                {/* Share Card */}
                <button
                  onClick={handleShareCard}
                  disabled={shareLoading}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm cursor-pointer ${theme === "cosmic" ? "bg-gradient-to-r from-purple-800/50 via-purple-700/50 to-purple-800/50 hover:from-purple-700/50 hover:via-purple-600/50 hover:to-purple-700/50 text-purple-200/80 border-purple-400/15" : "bg-gradient-to-r from-purple-600/50 via-purple-500/50 to-purple-600/50 hover:from-purple-500/50 hover:via-purple-400/50 hover:to-purple-500/50 text-purple-800/80 border-purple-500/20"} border transition-all disabled:opacity-50`}
                >
                  {shareLoading ? "..." : t("bazi.shareCard")}
                </button>

                <div className="flex gap-3 pt-2">
                  <button onClick={reset} className={`flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer ${tk.sectionBg} ${theme === "cosmic" ? "text-amber-200/60 hover:bg-white/10" : "text-amber-700/60 hover:bg-white/80"} transition-colors border ${tk.border}`}>
                    {t("bazi.reset")}
                  </button>
                  <Link href="/" className={`flex-1 py-3 rounded-xl text-sm font-medium text-center ${tk.sectionBg} ${theme === "cosmic" ? "text-amber-200/60 hover:bg-white/10" : "text-amber-700/60 hover:bg-white/80"} transition-colors border ${tk.border}`}>
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
