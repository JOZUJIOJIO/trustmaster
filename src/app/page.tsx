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
      {/* === Cosmic background === */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#060410]" />
        <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 90% 70% at 25% 35%, rgba(60,20,120,0.18) 0%, transparent 55%)", animationDuration: "40s" }} />
        <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 70% 55% at 75% 55%, rgba(140,80,20,0.12) 0%, transparent 50%)", animationDuration: "55s", animationDirection: "reverse" }} />
        <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(20,40,100,0.1) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(50,20,80,0.08) 0%, transparent 45%)", animationDuration: "70s" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ background: "linear-gradient(135deg, transparent 20%, rgba(200,180,150,1) 45%, rgba(200,180,150,0.6) 50%, rgba(200,180,150,1) 55%, transparent 80%)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
        <StarfieldCanvas />
      </div>

      {/* ===== Hero ===== */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-fadeIn" style={{ animationDuration: "1s" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold text-amber-100/80 tracking-widest uppercase">
              Kairós
            </span>
          </div>
          <div className="flex items-center gap-5">
            {user && (
              <Link href="/profile" className="text-sm text-amber-200/40 hover:text-amber-200/70 transition-colors">
                {locale === "zh" ? "我的" : "Profile"}
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-4">
          {/* V3: Larger Taiji, no decorative text */}
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: "0.3s", animationDuration: "2s", animationFillMode: "both" }}>
            <TaijiSvg size={160} />
          </div>

          {/* V5: Clear type hierarchy — Level 1: title */}
          <h1 className="font-display text-gradient-gold text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.15] min-h-[1.2em]">
            <TypewriterText text={t("hero.title")} delay={800} />
          </h1>

          {/* V5: Level 2: subtitle */}
          <p className="mt-4 text-amber-200/60 text-sm sm:text-base max-w-md leading-relaxed animate-fadeIn"
             style={{ animationDelay: "2.5s", animationDuration: "1.5s", animationFillMode: "both" }}>
            {t("hero.subtitle")}
          </p>

          {/* Date input */}
          <div className="mt-8 w-full max-w-sm mx-auto animate-fadeIn" style={{ animationDelay: "3s", animationDuration: "1s", animationFillMode: "both" }}>
            {/* V5: Level 3: auxiliary */}
            <p className="text-amber-200/25 text-xs mb-3 tracking-wider">
              {locale === "zh" ? "输入你的出生日期" : "Enter your birth date"}
            </p>
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-amber-400/15 text-amber-100 text-center focus:outline-none focus:border-amber-400/30 transition-all [color-scheme:dark]"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Instant preview */}
          {quickPreview && (
            <div className="mt-6 w-full max-w-sm mx-auto animate-fadeIn">
              <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {/* V5: Level 3 */}
                    <div className="text-[10px] text-amber-200/25 mb-1 uppercase tracking-wider">{locale === "zh" ? "你的日主" : "Day Master"}</div>
                    {/* V5: Level 1 */}
                    <div className="text-3xl font-bold text-amber-100">
                      {quickPreview.dayMaster}
                      <span className="text-lg ml-1">{ELEMENT_EMOJI[quickPreview.dayMasterElement]}</span>
                    </div>
                    {/* V5: Level 2 */}
                    <div className="text-xs text-amber-200/60 mt-0.5">
                      {quickPreview.dayMasterElement}{locale === "zh" ? "命" : ""} · {quickPreview.dayMasterStrength === "strong" ? (locale === "zh" ? "身强" : "Strong") : (locale === "zh" ? "身弱" : "Gentle")}
                    </div>
                  </div>
                  <div className="text-4xl">{quickPreview.zodiacEmoji}</div>
                </div>

                {/* V5: Level 2 */}
                <p className="text-sm text-amber-200/60 leading-relaxed mb-4">
                  {locale === "zh" ? quickPreview.dayMasterDesc : quickPreview.dayMasterDescEn}
                </p>

                {/* Five elements bar */}
                <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-2">
                  {(["木", "火", "土", "金", "水"] as const).map((el) => {
                    const count = quickPreview.fiveElements[el];
                    const total = Object.values(quickPreview.fiveElements).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? (count / total) * 100 : 20;
                    return <div key={el} style={{ width: `${pct}%`, backgroundColor: ELEMENT_COLORS[el] }} className="transition-all duration-500 opacity-60" />;
                  })}
                </div>
                {/* V5: Level 3 */}
                <div className="flex justify-between text-[9px] text-amber-200/25">
                  {(["木", "火", "土", "金", "水"] as const).map((el) => (
                    <span key={el}>{el} {quickPreview.fiveElements[el]}</span>
                  ))}
                </div>

                {/* V1: Outlined CTA inside preview */}
                <Link
                  href={`/fortune?date=${quickDate}`}
                  className="mt-4 block w-full py-3 rounded-xl text-sm text-center font-medium
                             border border-amber-400/30 text-amber-200/80
                             hover:bg-amber-400/[0.06] hover:text-amber-100 hover:border-amber-400/50
                             transition-all duration-300"
                >
                  {locale === "zh" ? "查看完整解读 →" : "Get Full Reading →"}
                </Link>
              </div>
            </div>
          )}

          {/* V1: Outlined CTA when no date */}
          {!quickPreview && (
            <Link
              href="/fortune"
              className="mt-8 inline-block px-10 py-4 rounded-full text-base lg:text-lg font-medium
                         border border-amber-400/30 text-amber-200/80
                         hover:bg-amber-400/[0.06] hover:text-amber-100 hover:border-amber-400/50
                         hover:shadow-[0_0_40px_rgba(217,169,106,0.08)]
                         transition-all duration-500 animate-fadeIn"
              style={{ animationDelay: "3.5s", animationFillMode: "both" }}
            >
              {t("hero.cta")} →
            </Link>
          )}

          {/* V5: Level 3 */}
          <p className="text-amber-200/20 text-[10px] mt-3 animate-fadeIn" style={{ animationDelay: "3.8s", animationFillMode: "both" }}>
            {locale === "zh" ? "免费 · 无需注册 · 即时生成" : "Free · No signup · Instant"}
          </p>
        </div>

        <div className="pb-8 text-center animate-bounce text-amber-400/20 text-xs">↓</div>
      </div>

      {/* ===== Final CTA ===== */}
      <section className="relative z-10 py-20 lg:py-28 px-6 text-center">
        <div className="max-w-lg mx-auto">
          {/* V5: Level 1 */}
          <h2 className="text-2xl lg:text-3xl font-bold text-amber-100 mb-4">
            {locale === "zh" ? "你的时刻，就是现在" : "Your Moment Is Now"}
          </h2>
          {/* V5: Level 2 */}
          <p className="text-sm text-amber-200/60 mb-8">
            {locale === "zh" ? "免费开始，无需注册，即时生成你的命盘。" : "Start free, no signup required, get your chart instantly."}
          </p>
          {/* V1: Outlined CTA */}
          <Link
            href="/fortune"
            className="inline-block px-10 py-4 rounded-full text-base font-medium
                       border border-amber-400/30 text-amber-200/80
                       hover:bg-amber-400/[0.06] hover:text-amber-100 hover:border-amber-400/50
                       hover:shadow-[0_0_40px_rgba(217,169,106,0.08)]
                       transition-all duration-500"
          >
            {t("hero.cta")} →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-400/[0.06] py-8 px-6">
        <div className="max-w-lg mx-auto text-center">
          {/* V5: Level 3 */}
          <div className="flex items-center justify-center gap-4 text-xs text-amber-200/20 mb-4">
            <Link href="/about" className="hover:text-amber-200/40 transition-colors">{locale === "zh" ? "关于" : "About"}</Link>
            <span className="text-amber-200/10">·</span>
            <Link href="/learn" className="hover:text-amber-200/40 transition-colors">{locale === "zh" ? "了解八字" : "Learn"}</Link>
            <span className="text-amber-200/10">·</span>
            <Link href="/terms" className="hover:text-amber-200/40 transition-colors">{t("footer.terms")}</Link>
            <span className="text-amber-200/10">·</span>
            <Link href="/privacy" className="hover:text-amber-200/40 transition-colors">{t("footer.privacy")}</Link>
          </div>
          <p className="text-[10px] text-amber-200/10">© 2026 Kairós</p>
        </div>
      </footer>

      <div className="pb-20 lg:pb-0 relative z-10">
        <BottomNav />
      </div>
    </div>
  );
}
