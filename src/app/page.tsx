"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { TypewriterText } from "@/components/MysticalEffects";
import StarfieldCanvas from "@/components/StarfieldCanvas";
import TaijiSvg from "@/components/TaijiSvg";
import { useAuth } from "@/lib/supabase/auth-context";
import { calculateBazi, ELEMENT_EMOJI, ELEMENT_COLORS, type BaziChart } from "@/lib/bazi";

export default function Home() {
  const [quickDate, setQuickDate] = useState("");
  const { locale, t } = useLocale();
  const { user } = useAuth();

  // Instant BaZi preview from date input
  const quickPreview = useMemo<BaziChart | null>(() => {
    if (!quickDate) return null;
    try {
      const [y, m, d] = quickDate.split("-").map(Number);
      if (!y || !m || !d) return null;
      return calculateBazi(y, m, d, "午", "male");
    } catch { return null; }
  }, [quickDate]);

  return (
    <div className="relative overflow-hidden bg-[#060410]">
      {/* === Background — deep cosmic atmosphere (covers entire page) === */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#060410]" />
        <div
          className="absolute inset-0 animate-drift"
          style={{
            background: "radial-gradient(ellipse 90% 70% at 25% 35%, rgba(60,20,120,0.18) 0%, transparent 55%)",
            animationDuration: "40s",
          }}
        />
        <div
          className="absolute inset-0 animate-drift"
          style={{
            background: "radial-gradient(ellipse 70% 55% at 75% 55%, rgba(140,80,20,0.12) 0%, transparent 50%)",
            animationDuration: "55s",
            animationDirection: "reverse",
          }}
        />
        <div
          className="absolute inset-0 animate-drift"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(20,40,100,0.1) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(50,20,80,0.08) 0%, transparent 45%)",
            animationDuration: "70s",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background: "linear-gradient(135deg, transparent 20%, rgba(200,180,150,1) 45%, rgba(200,180,150,0.6) 50%, rgba(200,180,150,1) 55%, transparent 80%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
        <StarfieldCanvas />
      </div>

      {/* ===== Hero Section (First Screen) ===== */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-fadeIn" style={{ animationDuration: "1s" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl drop-shadow-lg">🔮</span>
            <span className="text-xl font-bold text-amber-100/90 tracking-widest uppercase drop-shadow-lg">
              Kairós
            </span>
          </div>
          <div className="flex items-center gap-5">
            {user && (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm text-amber-200/60 hover:text-amber-200 transition-colors"
              >
                {locale === "zh" ? "👤 我的" : "👤 Profile"}
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-4">
          <div className="mb-4 animate-fadeIn" style={{ animationDelay: "0.3s", animationDuration: "2s", animationFillMode: "both" }}>
            <TaijiSvg size={96} />
          </div>

          <div className="flex items-center gap-3 mb-4 animate-fadeIn" style={{ animationDelay: "0.8s", animationDuration: "1.5s", animationFillMode: "both" }}>
            <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "1s" }} />
            <span className="text-amber-400/50 text-[10px] tracking-[0.4em] uppercase">
              Ancient Eastern Wisdom × AI
            </span>
            <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "1s" }} />
          </div>

          <h1 className="font-display text-gradient-gold text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.15] min-h-[1.2em]">
            <TypewriterText text={t("hero.title")} delay={1200} />
          </h1>

          <p className="mt-4 text-amber-100/50 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed animate-fadeIn"
             style={{ animationDelay: "3s", animationDuration: "1.5s", animationFillMode: "both" }}>
            {t("hero.subtitle")}
          </p>

          {/* Date input + instant preview */}
          <div className="mt-8 w-full max-w-sm mx-auto animate-fadeIn" style={{ animationDelay: "3.2s", animationDuration: "1s", animationFillMode: "both" }}>
            <p className="text-amber-200/30 text-xs mb-3 tracking-wider">
              {locale === "zh" ? "输入你的出生日期" : "Enter your birth date"}
            </p>
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-amber-400/20 text-amber-100 text-center placeholder-amber-200/30 focus:outline-none focus:border-amber-400/40 focus:bg-white/[0.08] transition-all [color-scheme:dark]"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Instant preview card */}
          {quickPreview && (
            <div className="mt-6 w-full max-w-sm mx-auto animate-fadeIn">
              <div className="bg-white/[0.04] border border-amber-400/15 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-amber-200/40 mb-1">{locale === "zh" ? "你的日主" : "Your Day Master"}</div>
                    <div className="text-3xl font-bold text-amber-100">
                      {quickPreview.dayMaster}
                      <span className="text-lg ml-1">{ELEMENT_EMOJI[quickPreview.dayMasterElement]}</span>
                    </div>
                    <div className="text-xs text-amber-200/50 mt-0.5">
                      {quickPreview.dayMasterElement}{locale === "zh" ? "命" : ""} · {quickPreview.dayMasterStrength === "strong" ? (locale === "zh" ? "身强" : "Strong") : (locale === "zh" ? "身弱" : "Gentle")}
                    </div>
                  </div>
                  <div className="text-4xl">{quickPreview.zodiacEmoji}</div>
                </div>

                <p className="text-sm text-amber-100/60 leading-relaxed mb-4">
                  {locale === "zh" ? quickPreview.dayMasterDesc : quickPreview.dayMasterDescEn}
                </p>

                {/* Five elements bar */}
                <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
                  {(["木", "火", "土", "金", "水"] as const).map((el) => {
                    const count = quickPreview.fiveElements[el];
                    const total = Object.values(quickPreview.fiveElements).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? (count / total) * 100 : 20;
                    return (
                      <div
                        key={el}
                        style={{ width: `${pct}%`, backgroundColor: ELEMENT_COLORS[el] }}
                        className="transition-all duration-500 opacity-70"
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-amber-200/30">
                  {(["木", "火", "土", "金", "水"] as const).map((el) => (
                    <span key={el}>{ELEMENT_EMOJI[el]} {el} {quickPreview.fiveElements[el]}</span>
                  ))}
                </div>

                <Link
                  href={`/fortune?date=${quickDate}`}
                  className="mt-4 block w-full py-3 rounded-xl font-semibold text-sm text-center
                             bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                             text-white border border-amber-500/30
                             hover:shadow-[0_0_30px_rgba(217,119,6,0.25)] transition-all"
                >
                  {locale === "zh" ? "查看完整解读 →" : "Get Full Reading →"}
                </Link>
              </div>
            </div>
          )}

          {/* CTA when no date entered */}
          {!quickPreview && (
            <Link
              href="/fortune"
              className="mt-6 inline-block px-10 py-4 rounded-full font-semibold text-base lg:text-lg
                         bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                         text-white border border-amber-500/30
                         shadow-[0_0_40px_rgba(217,119,6,0.2)] hover:shadow-[0_0_60px_rgba(217,119,6,0.35)]
                         hover:scale-105 transition-all duration-500 animate-glowPulse animate-fadeIn border-flow"
              style={{ animationDelay: "3.5s", animationFillMode: "both" }}
            >
              {t("hero.cta")} →
            </Link>
          )}

          <p className="text-amber-200/15 text-[10px] mt-3 animate-fadeIn" style={{ animationDelay: "3.8s", animationFillMode: "both" }}>
            {locale === "zh" ? "免费 · 无需注册 · 即时生成" : "Free · No signup · Instant"}
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="pb-8 text-center animate-bounce text-amber-400/30 text-xs">
          ↓
        </div>
      </div>

      {/* Spacer between hero and CTA */}

      {/* ===== Final CTA ===== */}
      <section className="relative z-10 py-20 lg:py-28 px-6 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-amber-100 mb-4">
            {locale === "zh" ? "你的时刻，就是现在" : "Your Moment Is Now"}
          </h2>
          <p className="text-sm text-amber-100/40 mb-8">
            {locale === "zh"
              ? "免费开始，无需注册，即时生成你的命盘。"
              : "Start free, no signup required, get your chart instantly."}
          </p>
          <Link
            href="/fortune"
            className="inline-block px-10 py-4 rounded-full font-semibold text-base cursor-pointer
                       bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                       text-white border border-amber-500/30
                       shadow-[0_0_40px_rgba(217,119,6,0.2)] hover:shadow-[0_0_60px_rgba(217,119,6,0.35)]
                       hover:scale-105 transition-all duration-500"
          >
            {t("hero.cta")} →
          </Link>
        </div>
      </section>

      {/* ===== Footer — minimal ===== */}
      <footer className="relative z-10 border-t border-amber-400/10 py-8 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-amber-200/25 mb-4">
            <Link href="/about" className="hover:text-amber-200/50 transition-colors">{locale === "zh" ? "关于" : "About"}</Link>
            <span>·</span>
            <Link href="/learn" className="hover:text-amber-200/50 transition-colors">{locale === "zh" ? "了解八字" : "Learn"}</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-amber-200/50 transition-colors">{t("footer.terms")}</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-amber-200/50 transition-colors">{t("footer.privacy")}</Link>
          </div>
          <p className="text-[10px] text-amber-200/15">© 2026 Kairós</p>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="pb-20 lg:pb-0 relative z-10">
        <BottomNav />
      </div>
    </div>
  );
}
