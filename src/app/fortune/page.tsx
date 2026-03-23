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
    <div className="min-h-screen">
      {/* PC Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-900">{t("app.name")}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">{t("horoscope.title")}</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/" className="hover:text-amber-700">{t("nav.home")}</Link>
              <Link href="/fortune" className="text-amber-800 font-medium">{t("nav.fortune")}</Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between h-11 px-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <Link href="/" className="text-amber-800 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px]">{t("horoscope.title")}</span>
        </div>
        <LanguageSwitcher />
      </div>

      <main className="lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-10 pb-24 lg:pb-10">
        {!result ? (
          /* ===== Sign Selection ===== */
          <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:overflow-hidden">
            {/* Hero */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-amber-50 px-4 py-8 lg:py-12 text-center">
              <span className="text-5xl lg:text-6xl block mb-4">✨</span>
              <h1 className="text-xl lg:text-3xl font-bold text-gray-900">{t("horoscope.title")}</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-2">{t("horoscope.subtitle")}</p>
            </div>

            {/* Birthday input */}
            <div className="px-4 py-4 lg:px-8 lg:py-6 border-b border-gray-100">
              <label className="text-xs text-gray-500 mb-1.5 block">{t("horoscope.orBirthday")}</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => handleBirthdayChange(e.target.value)}
                className="w-full lg:w-64 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Zodiac Grid */}
            <div className="px-4 py-4 lg:px-8 lg:py-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">{t("horoscope.selectSign")}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {zodiacSigns.map((sign) => (
                  <button
                    key={sign.id}
                    onClick={() => setSelectedSign(sign)}
                    className={`flex flex-col items-center gap-1 p-3 lg:p-4 rounded-xl border transition-all ${
                      selectedSign?.id === sign.id
                        ? "border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-200"
                        : "border-gray-100 hover:border-amber-200 hover:bg-amber-50/30"
                    }`}
                  >
                    <span className="text-2xl lg:text-3xl">{sign.symbol}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {sign.name[locale] || sign.name.en}
                    </span>
                    <span className="text-[10px] text-gray-400">{sign.dateRange}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="px-4 py-4 lg:px-8 lg:py-6 border-t border-gray-100">
              {error && (
                <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
              )}
              <button
                onClick={handleGenerate}
                disabled={!selectedSign || loading}
                className={`w-full lg:w-auto lg:px-12 py-3.5 rounded-xl font-semibold text-[15px] transition-all ${
                  selectedSign && !loading
                    ? "bg-amber-800 hover:bg-amber-900 text-white shadow-lg shadow-amber-800/20"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
            <div className={`bg-gradient-to-br ${getElementGradient(selectedSign?.element || "fire")} px-4 py-8 lg:py-12 text-center lg:rounded-2xl lg:border lg:border-gray-100`}>
              <span className="text-5xl lg:text-6xl block mb-3">{selectedSign?.symbol}</span>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                {selectedSign?.name[locale] || selectedSign?.name.en}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{t("horoscope.today")} · {result.date}</p>
              <div className="mt-3">
                <StarRating rating={result.rating} />
              </div>
            </div>

            {/* Overall Reading */}
            <div className="px-4 py-4 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6">
              <p className="text-[15px] lg:text-base text-gray-700 leading-relaxed">
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
                  className="bg-white rounded-xl border border-gray-100 p-4 lg:shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <h3 className="text-sm font-semibold text-gray-800">{item.label}</h3>
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Lucky Info */}
            <div className="px-4 lg:px-0 flex gap-3">
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 text-center lg:shadow-sm">
                <div className="text-xs text-gray-500 mb-1">{t("horoscope.lucky")}</div>
                <div className="text-2xl font-bold text-amber-800">{result.luckyNumber}</div>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 text-center lg:shadow-sm">
                <div className="text-xs text-gray-500 mb-1">{t("horoscope.color")}</div>
                <div className="text-lg font-bold text-amber-800">{result.luckyColor}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 lg:px-0 flex gap-3 pt-2">
              <button
                onClick={() => { setResult(null); setSelectedSign(null); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                {t("horoscope.tryAgain")}
              </button>
              <Link
                href="/"
                className="flex-1 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-medium text-sm text-center transition-colors shadow-lg shadow-amber-800/20"
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
