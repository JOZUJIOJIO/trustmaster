"use client";

import { useState, useEffect, Suspense } from "react";
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
    // Save chart for return visits
    try {
      sessionStorage.setItem("trustmaster_chart", JSON.stringify(result));
      sessionStorage.setItem("trustmaster_userName", userName);
      localStorage.setItem("trustmaster_saved_chart", JSON.stringify({ chart: result, userName, date: new Date().toISOString() }));
    } catch { /* ignore */ }
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
                  <div className="flex items-center gap-2 mt-3 text-amber-400/30 text-xs">
                    <span>Daily Score</span><span>·</span><span>今日宜忌</span><span>·</span><span>幸运指引</span>
                  </div>
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
                  <div className="flex items-center gap-2 mt-3 text-purple-400/30 text-xs">
                    <span>Compatibility</span><span>·</span><span>五行互补</span><span>·</span><span>关系洞察</span>
                  </div>
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
          <span className="text-sm text-amber-200/60">{t("bazi.title")}</span>
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
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectDate")}</h2>
            <p className="text-amber-200/40 text-sm mb-10">{t("bazi.dateHint")}</p>
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
              {t("bazi.next")}
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
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectHour")}</h2>
            <p className="text-amber-200/40 text-sm mb-8">{t("bazi.hourHint")}</p>
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
                  <div className="text-base font-bold">{isChinese ? h.name : h.nameEn}</div>
                  <div className="text-[10px] mt-0.5 opacity-50">{h.label}</div>
                </button>
              ))}
            </div>
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all w-6 ${i <= progressIndex ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <div className="text-5xl mb-6">⚤</div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.selectGender")}</h2>
            <p className="text-amber-200/40 text-sm mb-10">{t("bazi.genderHint")}</p>
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
                    {g === "male" ? t("bazi.male") : t("bazi.female")}
                  </div>
                </button>
              ))}
            </div>
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all w-6 ${i <= 3 ? "bg-amber-500" : "bg-white/10"}`} />
              ))}
            </div>
            <div className="text-5xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("bazi.enterName")}</h2>
            <p className="text-amber-200/40 text-sm mb-10">{t("bazi.nameHint")}</p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t("bazi.namePlaceholder")}
              className="w-full max-w-xs mx-auto bg-white/5 border border-amber-400/20 rounded-xl px-4 py-3.5 text-amber-100 text-center text-lg placeholder:text-amber-200/20 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
            />
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

            {/* ③ Five Elements — Radar Chart */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-2">
                <Term k="五行相生">五 行 分 布</Term>
              </h3>
              <RadarChart
                data={[
                  { label: "木", value: chart.fiveElements.木, color: chart.elementColors.木, emoji: "🌳" },
                  { label: "火", value: chart.fiveElements.火, color: chart.elementColors.火, emoji: "🔥" },
                  { label: "土", value: chart.fiveElements.土, color: chart.elementColors.土, emoji: "⛰️" },
                  { label: "金", value: chart.fiveElements.金, color: chart.elementColors.金, emoji: "⚙️" },
                  { label: "水", value: chart.fiveElements.水, color: chart.elementColors.水, emoji: "💧" },
                ]}
                maxValue={Math.max(...Object.values(chart.fiveElements), 3)}
              />
              {/* Bar details below radar */}
              <div className="space-y-2 mt-2">
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
              <div className="mt-3 pt-3 border-t border-white/5 text-center">
                <div className="text-xs text-amber-200/40 leading-loose">
                  🌳→🔥→⛰️→⚙️→💧→🌳 <span className="text-amber-200/20 ml-2">（相生）</span>
                </div>
              </div>
            </div>

            {/* ③.5 Personality Deep Dive (FREE — increases dwell time) */}
            <Accordion title={isChinese ? "性 格 蓝 图" : "PERSONALITY BLUEPRINT"} icon="🧠" defaultOpen={false}>
              <div className="space-y-3">
                {[
                  {
                    icon: "🧠",
                    title: "核心性格",
                    content: chart.dayMasterDesc,
                  },
                  {
                    icon: "💼",
                    title: "职场风格",
                    content: chart.dayMasterElement === "木" ? "注重规划和成长，适合管理、教育、策划类工作。团队中常担任组织者角色，但需注意不要过于固执己见。"
                      : chart.dayMasterElement === "火" ? "充满热情和感染力，适合销售、演讲、创意类工作。天生的领导者，但需注意控制急躁和冲动。"
                      : chart.dayMasterElement === "土" ? "踏实可靠、耐心细致，适合行政、财务、工程类工作。是团队的稳定器，但需注意避免过于保守错失机遇。"
                      : chart.dayMasterElement === "金" ? "果断高效、注重品质，适合法律、金融、技术类工作。执行力强，但需注意灵活变通，避免过于强势。"
                      : "灵活变通、善于沟通，适合贸易、传媒、咨询类工作。适应力强，但需注意增强定力，避免朝三暮四。",
                  },
                  {
                    icon: "❤️",
                    title: "恋爱风格",
                    content: chart.dayMasterElement === "木" ? "在感情中注重责任和承诺，对伴侣忠诚可靠。表达爱意可能比较含蓄，但内心深情。需要一个理解并支持自己成长的伴侣。"
                      : chart.dayMasterElement === "火" ? "热情奔放，在感情中主动大方。追求浪漫和激情，但热度来得快去得也快。需要学习在平淡中维护关系。"
                      : chart.dayMasterElement === "土" ? "在感情中温厚踏实，属于细水长流型。重视家庭和安全感，愿意为伴侣付出。但可能缺少浪漫情调。"
                      : chart.dayMasterElement === "金" ? "在感情中讲求原则和界限，不轻易表露感情。一旦认定会非常专一。但可能因过于理性而忽略伴侣的情感需求。"
                      : "在感情中温柔体贴、善解人意。容易被感动，也容易感动他人。但可能因过于敏感而产生不必要的担忧。",
                  },
                  {
                    icon: "⚡",
                    title: "潜在挑战",
                    content: chart.dayMasterStrength === "strong"
                      ? "身强之人精力旺盛但容易过于自信，需注意：1）倾听他人意见，避免独断；2）控制消费欲望；3）保持谦虚，警惕盲目扩张。"
                      : "身弱之人心思细腻但容易缺乏自信，需注意：1）多与正能量的人交往；2）补充喜用神元素增强能量；3）设定小目标逐步建立信心。",
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-semibold text-amber-200/80">{item.title}</span>
                    </div>
                    <p className="text-xs text-amber-100/50 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </Accordion>

            {/* ④ Key Indicators */}
            <Accordion title={isChinese ? "命 盘 要 素" : "KEY INDICATORS"} icon="🎯" defaultOpen={true}>
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
            </Accordion>

            {/* ⑤ Lucky Element Recommendations */}
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

            {/* ⑦ Ten-Year Luck Cycles (大运时间线) */}
            {chart.luckCycles && chart.luckCycles.length > 0 && (
              <Accordion title={isChinese ? "大 运 时 间 线" : "LUCK CYCLE TIMELINE"} icon="📅" defaultOpen={false}>
                <p className="text-center text-amber-200/25 text-[10px] mb-4">{isChinese ? "每十年一个大运周期，影响人生阶段性运势走向" : "Each 10-year cycle brings different energies that shape your life phases"}</p>
                <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
                  <div className="flex gap-2.5" style={{ minWidth: chart.luckCycles.length * 80 }}>
                    {chart.luckCycles.map((cycle, i) => {
                      const birthYear = parseInt(chart.solarDate);
                      const cycleYear = birthYear + cycle.startAge;
                      const currentYear = new Date().getFullYear();
                      const isCurrent = currentYear >= cycleYear && currentYear < cycleYear + 10;
                      const isPast = currentYear >= cycleYear + 10;

                      return (
                        <div
                          key={i}
                          className={`flex-shrink-0 w-[72px] rounded-xl p-2.5 text-center border transition-all ${
                            isCurrent
                              ? "bg-amber-700/20 border-amber-500/30 ring-1 ring-amber-500/20"
                              : isPast
                              ? "bg-white/[0.02] border-white/5 opacity-60"
                              : "bg-white/[0.03] border-white/5"
                          }`}
                        >
                          <div className="text-[9px] text-amber-200/30 mb-1">{cycle.startAge}-{cycle.startAge + 9}{isChinese ? "岁" : "yr"}</div>
                          <div className="text-lg font-bold text-amber-300">{cycle.stem}</div>
                          <div className="text-lg font-bold text-amber-100">{cycle.branch}</div>
                          <div className="text-[9px] text-amber-200/30 mt-1">{cycle.element}</div>
                          <div className="text-[8px] text-amber-400/25 mt-0.5"><Term k={cycle.tenGod}>{cycle.tenGod}</Term></div>
                          {cycle.nayin && <div className="text-[8px] text-amber-200/15 mt-0.5">{cycle.nayin}</div>}
                          {isCurrent && <div className="text-[8px] text-amber-400 mt-1 font-bold">← {isChinese ? "当前" : "NOW"}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center text-amber-200/15 text-[10px] mt-3">← {isChinese ? "左右滑动查看完整时间线" : "Scroll to see full timeline"} →</div>
              </Accordion>
            )}

            {/* ⑧ Historical Verification — Trust Builder */}
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
                      {t("bazi.unlock")}
                    </button>
                  ) : (
                    /* Paywall Modal */
                    <div className="bg-white/[0.03] border border-amber-400/15 rounded-2xl p-6 space-y-5">
                      <div className="text-center">
                        <div className="text-3xl mb-3">✨</div>
                        <h3 className="text-xl font-bold text-amber-100">{t("bazi.unlockTitle")}</h3>
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
                {pdfLoading ? "..." : t("bazi.exportPdf")}
              </button>
            )}

            {/* Share Card — always available */}
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
        )}
      </main>
      <BottomNav />
    </div>
  );
}
