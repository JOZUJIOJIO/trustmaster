"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { useTheme } from "@/lib/ThemeContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import StarfieldCanvas from "@/components/StarfieldCanvas";
import CloudCanvas from "@/components/CloudCanvas";
import TaijiSvg from "@/components/TaijiSvg";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/supabase/auth-context";
import { calculateBazi, ELEMENT_EMOJI, ELEMENT_COLORS, type BaziChart } from "@/lib/bazi";
import { themeTokens } from "@/lib/theme-tokens";

export default function Home() {
  const [quickDate, setQuickDate] = useState("");
  const [taijiSpin, setTaijiSpin] = useState(false);
  const [dateFlash, setDateFlash] = useState(false);
  const [fading, setFading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { locale, t } = useLocale();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const tk = themeTokens[theme];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const quickPreview = useMemo<BaziChart | null>(() => {
    if (!quickDate) return null;
    try {
      const [y, m, d] = quickDate.split("-").map(Number);
      if (!y || !m || !d) return null;
      return calculateBazi(y, m, d, "午", "male");
    } catch { return null; }
  }, [quickDate]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuickDate(val);
    if (val) {
      setDateFlash(true);
      setTimeout(() => setDateFlash(false), 600);
      setTaijiSpin(true);
      setTimeout(() => setTaijiSpin(false), 800);
    }
  }, []);

  const handleNavigate = useCallback((href: string) => {
    setFading(true);
    setTimeout(() => router.push(href), 200);
  }, [router]);

  return (
    <div className={`relative overflow-hidden transition-colors duration-700 ${tk.bg} ${fading ? "opacity-0 scale-[0.99]" : "opacity-100"}`}
         style={{ transition: "background-color 0.7s, opacity 0.2s" }}>

      {/* === Backgrounds === */}
      {theme === "cosmic" ? (
        <div className="fixed inset-0 z-0 animate-breatheSway">
          <div className="absolute inset-0 bg-[#060410]" />
          <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 90% 70% at 25% 35%, rgba(60,20,120,0.18) 0%, transparent 55%)", animationDuration: "40s" }} />
          <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 70% 55% at 75% 55%, rgba(100,60,30,0.08) 0%, transparent 50%)", animationDuration: "55s", animationDirection: "reverse" }} />
          <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(20,40,100,0.1) 0%, transparent 50%)", animationDuration: "70s" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ background: "linear-gradient(135deg, transparent 20%, rgba(242,240,235,1) 45%, rgba(242,240,235,0.5) 50%, rgba(242,240,235,1) 55%, transparent 80%)" }} />
          <StarfieldCanvas />
          {/* Helmet vignette — dark */}
          <div className="absolute inset-0 z-[2] helmet-vignette" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 animate-breatheSway">
          {/* Sky — gradient from deep blue-lavender at top to warm white below */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #C8CBE0 0%, #D8D5E8 15%, #E8E6F0 30%, #F2F0EB 50%, #F8F5EE 70%, #FFFDF8 100%)" }} />
          {/* Sun glow — warm light from upper right */}
          <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 60% 50% at 75% 5%, rgba(255,210,160,0.25) 0%, transparent 55%)", animationDuration: "25s" }} />
          {/* Secondary warm light */}
          <div className="absolute inset-0 animate-drift" style={{ background: "radial-gradient(ellipse 40% 30% at 25% 15%, rgba(255,200,170,0.1) 0%, transparent 50%)", animationDuration: "40s", animationDirection: "reverse" }} />
          {/* Cloud layer below */}
          <div className="absolute inset-x-0 bottom-0 h-[55%]" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0.7) 85%, rgba(255,255,255,0.85) 100%)" }} />
          <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: "linear-gradient(180deg, transparent, rgba(242,240,235,0.5))" }} />
          <CloudCanvas />
          {/* Helmet vignette — light */}
          <div className="absolute inset-0 z-[2] helmet-vignette-light" />
        </div>
      )}

      {/* ===== Hero ===== */}
      <div className="relative z-10 min-h-screen flex flex-col pb-20">
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-riseIn" style={{ animationDelay: "0.1s" }}>
          <span className={`text-lg font-light tracking-[0.15em] ${theme === "cosmic" ? "text-[#F2F0EB]/60" : "text-[#1a1520]/50"}`}>
            Kairós
          </span>
          <div className="flex items-center gap-4">
            {user && (
              <Link href="/profile" className={`text-sm btn-haptic transition-colors ${tk.text3} hover:${tk.text2}`}>
                {locale === "zh" ? "我的" : "Profile"}
              </Link>
            )}
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Taiji */}
          <div
            className={`mb-14 lg:mb-16 animate-materialize ${taijiSpin ? "animate-compassSpin" : ""}`}
            style={{ animationDelay: taijiSpin ? "0s" : "0.3s", transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <TaijiSvg size={160} />
          </div>

          {/* Title */}
          <div>
            <h1
              className={`font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-[0.1em] max-w-4xl leading-[1.2] animate-riseIn ${tk.text1}`}
              style={{ animationDelay: "1.2s", animationDuration: "0.8s" }}
            >
              {t("hero.title")}
            </h1>
            <p
              className={`mt-2 text-sm sm:text-base tracking-widest animate-riseIn ${tk.text2}`}
              style={{ animationDelay: "1.8s", animationDuration: "0.6s" }}
            >
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Date input */}
          <div className="mt-12 w-full max-w-xs mx-auto animate-riseIn" style={{ animationDelay: "2.4s" }}>
            <p className={`text-[10px] mb-3 tracking-[0.2em] uppercase ${tk.text3}`}>
              {locale === "zh" ? "输入出生日期" : "Birth date"}
            </p>
            <input
              type="date"
              value={quickDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className={`w-full px-4 py-3 rounded-xl border text-center focus:outline-none transition-all duration-300 ${
                dateFlash ? "animate-goldenFlash" : `${tk.input} focus:border-amber-400/30`
              }`}
              style={{ colorScheme: theme === "cosmic" ? "dark" : "light" }}
            />
          </div>

          {/* Preview card */}
          {quickPreview && (
            <div className="mt-6 w-full max-w-xs mx-auto animate-cardExpand">
              <div className={`border rounded-2xl p-5 backdrop-blur-sm stagger-card ${tk.card}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className={`text-[9px] mb-1 uppercase tracking-[0.15em] ${tk.text3}`}>{locale === "zh" ? "日主" : "Day Master"}</div>
                    <div className={`text-3xl font-bold ${tk.text1}`}>
                      {quickPreview.dayMaster}
                      <span className="text-lg ml-1.5 opacity-70">{ELEMENT_EMOJI[quickPreview.dayMasterElement]}</span>
                    </div>
                    <div className={`text-[11px] mt-0.5 ${tk.text2}`}>
                      {quickPreview.dayMasterElement}{locale === "zh" ? "命" : ""} · {quickPreview.dayMasterStrength === "strong" ? (locale === "zh" ? "身强" : "Strong") : (locale === "zh" ? "身弱" : "Gentle")}
                    </div>
                  </div>
                  <div className="text-4xl opacity-80">{quickPreview.zodiacEmoji}</div>
                </div>

                <p className={`text-[13px] leading-relaxed mb-4 ${tk.text2}`}>
                  {locale === "zh" ? quickPreview.dayMasterDesc : quickPreview.dayMasterDescEn}
                </p>

                <div>
                  <div className="flex gap-0.5 h-1 rounded-full overflow-hidden mb-1.5">
                    {(["木", "火", "土", "金", "水"] as const).map((el, i) => {
                      const count = quickPreview.fiveElements[el];
                      const total = Object.values(quickPreview.fiveElements).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? (count / total) * 100 : 20;
                      return (
                        <div key={el} style={{ width: `${pct}%`, backgroundColor: ELEMENT_COLORS[el], animationDelay: `${400 + i * 100}ms` }}
                             className={`animate-barFill ${theme === "cosmic" ? "opacity-50" : "opacity-65"}`} />
                      );
                    })}
                  </div>
                  <div className={`flex justify-between text-[8px] ${tk.text3}`}>
                    {(["木", "火", "土", "金", "水"] as const).map((el) => (
                      <span key={el}>{el} {quickPreview.fiveElements[el]}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate(`/fortune?date=${quickDate}`)}
                  className={`mt-4 block w-full py-3 rounded-xl text-sm text-center font-medium btn-haptic transition-all duration-300 cursor-pointer border ${tk.ctaGold}`}
                >
                  {locale === "zh" ? "查看完整解读 →" : "Full Reading →"}
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          {!quickPreview && (
            <button
              onClick={() => handleNavigate("/fortune")}
              className={`mt-8 px-10 py-3.5 rounded-full text-sm font-medium tracking-wider btn-haptic cursor-pointer border transition-all duration-500 animate-riseIn ${tk.cta}`}
              style={{ animationDelay: "3s" }}
            >
              {t("hero.cta")} →
            </button>
          )}

          <p className={`text-[9px] mt-3 tracking-[0.15em] animate-riseIn ${tk.text3}`} style={{ animationDelay: "3.3s" }}>
            {locale === "zh" ? "免费 · 无需注册 · 即时生成" : "Free · No signup · Instant"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 border-t py-6 px-6 ${tk.border}`}>
        <div className="max-w-sm mx-auto text-center">
          <div className={`flex items-center justify-center gap-4 text-[10px] ${tk.footerText}`}>
            <Link href="/about" className="hover:opacity-60 transition-opacity btn-haptic">{locale === "zh" ? "关于" : "About"}</Link>
            <span className={tk.footerDot}>·</span>
            <Link href="/learn" className="hover:opacity-60 transition-opacity btn-haptic">{locale === "zh" ? "了解八字" : "Learn"}</Link>
            <span className={tk.footerDot}>·</span>
            <Link href="/terms" className="hover:opacity-60 transition-opacity btn-haptic">{t("footer.terms")}</Link>
            <span className={tk.footerDot}>·</span>
            <Link href="/privacy" className="hover:opacity-60 transition-opacity btn-haptic">{t("footer.privacy")}</Link>
          </div>
          <p className={`text-[9px] mt-2 opacity-50 ${tk.footerText}`}>© 2026 Kairós</p>
        </div>
      </footer>

      <div className="pb-20 lg:pb-0 relative z-10">
        <BottomNav />
      </div>
    </div>
  );
}
