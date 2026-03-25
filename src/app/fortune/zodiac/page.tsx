"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { zodiacSigns, getZodiacByDate, getElementGradient, type ZodiacSign } from "@/lib/horoscope";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HoroscopeResult {
  sign: string;
  signName: string;
  date: string;
  overall: string;
  love: string;
  career: string;
  finance: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  rating: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500 text-lg">
      {"★".repeat(Math.min(rating, 5))}
      {"☆".repeat(Math.max(5 - rating, 0))}
    </span>
  );
}

export default function FortunePage() {
  const { locale, t } = useLocale();
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HoroscopeResult | null>(null);
  const [error, setError] = useState("");

  const handleBirthdayChange = (value: string) => {
    setBirthday(value);
    if (value) {
      const date = new Date(value);
      const sign = getZodiacByDate(date.getMonth() + 1, date.getDate());
      if (sign) setSelectedSign(sign);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSign) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sign: selectedSign.symbol,
          signName: selectedSign.name.en,
          locale,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch {
      setError(t("horoscope.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0814]">
      {/* PC Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-[#0a0814]/80 backdrop-blur-md border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-200">{t("app.name")}</span>
            </Link>
            <span className="text-amber-200/20">/</span>
            <span className="text-sm text-amber-200/40">{t("horoscope.title")}</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm text-amber-200/60">
              <Link href="/" className="hover:text-amber-200">{t("nav.home")}</Link>
              <Link href="/fortune" className="text-amber-300 font-medium">{t("nav.fortune")}</Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between h-11 px-4 border-b border-amber-400/10 sticky top-0 bg-[#0a0814] z-10">
        <div className="flex items-center">
          <Link href="/" className="text-amber-200/60 hover:text-amber-200 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px] text-amber-100">{t("horoscope.title")}</span>
        </div>
        <LanguageSwitcher />
      </div>

      <main className="lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-10 pb-24 lg:pb-10">
        {!result ? (
          /* ===== Sign Selection ===== */
          <div className="lg:bg-white/[0.03] lg:rounded-2xl lg:border lg:border-amber-400/10 lg:overflow-hidden">
            {/* Hero */}
            <div className="bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-amber-900/10 px-4 py-8 lg:py-12 text-center">
              <span className="text-5xl lg:text-6xl block mb-4">✨</span>
              <h1 className="text-xl lg:text-3xl font-bold text-amber-100">{t("horoscope.title")}</h1>
              <p className="text-sm lg:text-base text-amber-200/60 mt-2">{t("horoscope.subtitle")}</p>
            </div>

            {/* Birthday input */}
            <div className="px-4 py-4 lg:px-8 lg:py-6 border-b border-amber-400/10">
              <label className="text-xs text-amber-200/40 mb-1.5 block">{t("horoscope.orBirthday")}</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => handleBirthdayChange(e.target.value)}
                className="w-full lg:w-64 px-4 py-2.5 border border-amber-400/20 bg-white/[0.05] text-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400/40"
              />
            </div>

            {/* Zodiac Grid */}
            <div className="px-4 py-4 lg:px-8 lg:py-6">
              <h2 className="text-sm font-semibold text-amber-200/80 mb-3">{t("horoscope.selectSign")}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {zodiacSigns.map((sign) => (
                  <button
                    key={sign.id}
                    onClick={() => setSelectedSign(sign)}
                    className={`flex flex-col items-center gap-1 p-3 lg:p-4 rounded-xl border transition-all ${
                      selectedSign?.id === sign.id
                        ? "border-amber-400/40 bg-amber-900/20 ring-2 ring-amber-400/20"
                        : "border-white/5 hover:border-amber-400/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="text-2xl lg:text-3xl">{sign.symbol}</span>
                    <span className="text-xs font-medium text-amber-200/70">
                      {sign.name[locale] || sign.name.en}
                    </span>
                    <span className="text-[10px] text-amber-200/30">{sign.dateRange}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="px-4 py-4 lg:px-8 lg:py-6 border-t border-amber-400/10">
              {error && (
                <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
              )}
              <button
                onClick={handleGenerate}
                disabled={!selectedSign || loading}
                className={`w-full lg:w-auto lg:px-12 py-3.5 rounded-xl font-semibold text-[15px] transition-all ${
                  selectedSign && !loading
                    ? "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white"
                    : "bg-white/[0.05] text-amber-200/30 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">🌀</span>
                    {t("horoscope.generating")}
                  </span>
                ) : (
                  `✨ ${t("horoscope.generate")}${selectedSign ? ` — ${selectedSign.name[locale] || selectedSign.name.en}` : ""}`
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ===== Result View ===== */
          <div className="lg:space-y-6">
            {/* Result Header */}
            <div className={`bg-gradient-to-br ${getElementGradient(selectedSign?.element || "fire")} px-4 py-8 lg:py-12 text-center lg:rounded-2xl lg:border lg:border-amber-400/10`}>
              <span className="text-5xl lg:text-6xl block mb-3">{selectedSign?.symbol}</span>
              <h1 className="text-xl lg:text-2xl font-bold text-amber-100">
                {selectedSign?.name[locale] || selectedSign?.name.en}
              </h1>
              <p className="text-sm text-amber-200/40 mt-1">{t("horoscope.today")} · {result.date}</p>
              <div className="mt-3">
                <StarRating rating={result.rating} />
              </div>
            </div>

            {/* Overall Reading */}
            <div className="px-4 py-4 lg:bg-white/[0.03] lg:rounded-2xl lg:border lg:border-amber-400/10 lg:p-6">
              <p className="text-[15px] lg:text-base text-amber-200/70 leading-relaxed">
                {result.overall}
              </p>
            </div>

            {/* Category Cards */}
            <div className="px-4 lg:px-0 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {[
                { key: "love", icon: "💕", label: t("horoscope.love"), text: result.love },
                { key: "career", icon: "💼", label: t("horoscope.career"), text: result.career },
                { key: "finance", icon: "💰", label: t("horoscope.finance"), text: result.finance },
                { key: "health", icon: "🧘", label: t("horoscope.health"), text: result.health },
              ].map((item) => (
                <div
                  key={item.key}
                  className="bg-white/[0.03] rounded-xl border border-amber-400/10 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <h3 className="text-sm font-semibold text-amber-200/80">{item.label}</h3>
                  </div>
                  <p className="text-[13px] text-amber-200/60 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Lucky Info */}
            <div className="px-4 lg:px-0 flex gap-3">
              <div className="flex-1 bg-white/[0.03] rounded-xl border border-amber-400/10 p-4 text-center">
                <div className="text-xs text-amber-200/40 mb-1">{t("horoscope.lucky")}</div>
                <div className="text-2xl font-bold text-amber-300">{result.luckyNumber}</div>
              </div>
              <div className="flex-1 bg-white/[0.03] rounded-xl border border-amber-400/10 p-4 text-center">
                <div className="text-xs text-amber-200/40 mb-1">{t("horoscope.color")}</div>
                <div className="text-lg font-bold text-amber-300">{result.luckyColor}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 lg:px-0 flex gap-3 pt-2">
              <button
                onClick={() => { setResult(null); setSelectedSign(null); }}
                className="flex-1 py-3 rounded-xl border border-white/5 text-amber-200/60 font-medium text-sm hover:bg-white/[0.05] transition-colors"
              >
                {t("horoscope.tryAgain")}
              </button>
              <Link
                href="/"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white font-medium text-sm text-center transition-colors"
              >
                {t("horoscope.consult")}
              </Link>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
