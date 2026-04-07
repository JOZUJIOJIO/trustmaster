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
      {/* Cosmic background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#060410]" />
        <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 90% 70% at 25% 35%, rgba(60,20,120,0.18) 0%, transparent 55%)", animationDuration: "40s" }} />
        <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 70% 55% at 75% 55%, rgba(100,60,30,0.08) 0%, transparent 50%)", animationDuration: "55s", animationDirection: "reverse" }} />
        <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(20,40,100,0.1) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(50,20,80,0.08) 0%, transparent 45%)", animationDuration: "70s" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ background: "linear-gradient(135deg, transparent 20%, rgba(242,240,235,1) 45%, rgba(242,240,235,0.5) 50%, rgba(242,240,235,1) 55%, transparent 80%)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
        <StarfieldCanvas />
      </div>

      {/* ===== Single screen — Hero ===== */}
      <div className="relative z-10 min-h-screen flex flex-col pb-20">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-fadeIn" style={{ animationDuration: "1s" }}>
          <span className="text-lg font-light text-[#F2F0EB]/60 tracking-[0.3em] uppercase">
            Kairós
          </span>
          <div className="flex items-center gap-5">
            {user && (
              <Link href="/profile" className="text-sm text-[#F2F0EB]/25 hover:text-[#F2F0EB]/50 transition-colors">
                {locale === "zh" ? "我的" : "Profile"}
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Content — with rhythm: loose → tight → loose */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Taiji — breathes alone */}
          <div className="mb-14 lg:mb-16 animate-fadeIn" style={{ animationDelay: "0.3s", animationDuration: "2s", animationFillMode: "both" }}>
            <TaijiSvg size={160} />
          </div>

          {/* Title + subtitle — tight group */}
          <div className="animate-fadeIn" style={{ animationDelay: "1s", animationDuration: "1.5s", animationFillMode: "both" }}>
            {/* #7: font-display for calligraphic feel, #2: wide letter-spacing */}
            <h1 className="font-display text-[#F2F0EB] text-4xl sm:text-5xl lg:text-7xl font-bold tracking-[0.1em] max-w-4xl leading-[1.2] min-h-[1.2em]">
              <TypewriterText text={t("hero.title")} delay={800} />
            </h1>
            {/* #3: Short subtitle, tight to title */}
            <p className="mt-2 text-[#F2F0EB]/35 text-sm sm:text-base tracking-widest">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Date input — loose spacing from title group */}
          <div className="mt-12 w-full max-w-xs mx-auto animate-fadeIn" style={{ animationDelay: "2.5s", animationDuration: "1s", animationFillMode: "both" }}>
            <p className="text-[#F2F0EB]/20 text-[10px] mb-3 tracking-[0.2em] uppercase">
              {locale === "zh" ? "输入出生日期" : "Birth date"}
            </p>
            {/* #5: Gold accent on focus */}
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className="w-full px-4 py-3 rounded-xl bg-[#F2F0EB]/[0.03] border border-[#F2F0EB]/[0.08] text-[#F2F0EB]/80 text-center focus:outline-none focus:border-amber-400/30 transition-all duration-300 [color-scheme:dark]"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Instant preview */}
          {quickPreview && (
            <div className="mt-6 w-full max-w-xs mx-auto animate-fadeIn">
              <div className="bg-[#F2F0EB]/[0.02] border border-[#F2F0EB]/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[9px] text-[#F2F0EB]/20 mb-1 uppercase tracking-[0.15em]">{locale === "zh" ? "日主" : "Day Master"}</div>
                    <div className="text-3xl font-bold text-[#F2F0EB]">
                      {quickPreview.dayMaster}
                      <span className="text-lg ml-1.5 opacity-70">{ELEMENT_EMOJI[quickPreview.dayMasterElement]}</span>
                    </div>
                    <div className="text-[11px] text-[#F2F0EB]/40 mt-0.5">
                      {quickPreview.dayMasterElement}{locale === "zh" ? "命" : ""} · {quickPreview.dayMasterStrength === "strong" ? (locale === "zh" ? "身强" : "Strong") : (locale === "zh" ? "身弱" : "Gentle")}
                    </div>
                  </div>
                  <div className="text-4xl opacity-80">{quickPreview.zodiacEmoji}</div>
                </div>

                <p className="text-[13px] text-[#F2F0EB]/40 leading-relaxed mb-4">
                  {locale === "zh" ? quickPreview.dayMasterDesc : quickPreview.dayMasterDescEn}
                </p>

                {/* Five elements bar — the one splash of color */}
                <div className="flex gap-0.5 h-1 rounded-full overflow-hidden mb-1.5">
                  {(["木", "火", "土", "金", "水"] as const).map((el) => {
                    const count = quickPreview.fiveElements[el];
                    const total = Object.values(quickPreview.fiveElements).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? (count / total) * 100 : 20;
                    return <div key={el} style={{ width: `${pct}%`, backgroundColor: ELEMENT_COLORS[el] }} className="transition-all duration-500 opacity-50" />;
                  })}
                </div>
                <div className="flex justify-between text-[8px] text-[#F2F0EB]/20 mb-4">
                  {(["木", "火", "土", "金", "水"] as const).map((el) => (
                    <span key={el}>{el} {quickPreview.fiveElements[el]}</span>
                  ))}
                </div>

                {/* #5: Gold accent CTA — the 1% color */}
                <Link
                  href={`/fortune?date=${quickDate}`}
                  className="block w-full py-3 rounded-xl text-sm text-center font-medium
                             border border-amber-400/20 text-amber-200/70
                             hover:bg-amber-400/[0.05] hover:text-amber-200/90 hover:border-amber-400/35
                             transition-all duration-300"
                >
                  {locale === "zh" ? "查看完整解读 →" : "Full Reading →"}
                </Link>
              </div>
            </div>
          )}

          {/* CTA when no date — outlined, quiet */}
          {!quickPreview && (
            <Link
              href="/fortune"
              className="mt-8 inline-block px-10 py-3.5 rounded-full text-sm font-medium tracking-wider
                         border border-[#F2F0EB]/12 text-[#F2F0EB]/50
                         hover:bg-[#F2F0EB]/[0.04] hover:text-[#F2F0EB]/70 hover:border-[#F2F0EB]/20
                         transition-all duration-500 animate-fadeIn"
              style={{ animationDelay: "3s", animationFillMode: "both" }}
            >
              {t("hero.cta")} →
            </Link>
          )}

          <p className="text-[#F2F0EB]/12 text-[9px] mt-3 tracking-[0.15em] animate-fadeIn" style={{ animationDelay: "3.5s", animationFillMode: "both" }}>
            {locale === "zh" ? "免费 · 无需注册 · 即时生成" : "Free · No signup · Instant"}
          </p>
        </div>
      </div>

      {/* #1: No duplicate CTA — just a quiet footer with secondary links */}
      <footer className="relative z-10 border-t border-[#F2F0EB]/[0.04] py-6 px-6">
        <div className="max-w-sm mx-auto text-center">
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#F2F0EB]/15">
            <Link href="/about" className="hover:text-[#F2F0EB]/30 transition-colors">{locale === "zh" ? "关于" : "About"}</Link>
            <span className="text-[#F2F0EB]/[0.06]">·</span>
            <Link href="/learn" className="hover:text-[#F2F0EB]/30 transition-colors">{locale === "zh" ? "了解八字" : "Learn"}</Link>
            <span className="text-[#F2F0EB]/[0.06]">·</span>
            <Link href="/terms" className="hover:text-[#F2F0EB]/30 transition-colors">{t("footer.terms")}</Link>
            <span className="text-[#F2F0EB]/[0.06]">·</span>
            <Link href="/privacy" className="hover:text-[#F2F0EB]/30 transition-colors">{t("footer.privacy")}</Link>
          </div>
          <p className="text-[9px] text-[#F2F0EB]/[0.08] mt-2">© 2026 Kairós</p>
        </div>
      </footer>

      <div className="pb-20 lg:pb-0 relative z-10">
        <BottomNav />
      </div>
    </div>
  );
}
