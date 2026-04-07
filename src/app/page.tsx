"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import StarfieldCanvas from "@/components/StarfieldCanvas";
import TaijiSvg from "@/components/TaijiSvg";
import { useAuth } from "@/lib/supabase/auth-context";
import { calculateBazi, ELEMENT_EMOJI, ELEMENT_COLORS, type BaziChart } from "@/lib/bazi";

export default function Home() {
  const [quickDate, setQuickDate] = useState("");
  const [taijiSpin, setTaijiSpin] = useState(false);
  const [dateFlash, setDateFlash] = useState(false);
  const [fading, setFading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const taijiRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLocale();
  const { user } = useAuth();
  const router = useRouter();

  // Scroll parallax for Taiji
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Calculate preview
  const quickPreview = useMemo<BaziChart | null>(() => {
    if (!quickDate) return null;
    try {
      const [y, m, d] = quickDate.split("-").map(Number);
      if (!y || !m || !d) return null;
      return calculateBazi(y, m, d, "午", "male");
    } catch { return null; }
  }, [quickDate]);

  // Date change handler with motion
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuickDate(val);
    if (val) {
      // Golden flash on input
      setDateFlash(true);
      setTimeout(() => setDateFlash(false), 600);
      // Taiji compass spin
      setTaijiSpin(true);
      setTimeout(() => setTaijiSpin(false), 800);
    }
  }, []);

  // Page transition handler
  const handleNavigate = useCallback((href: string) => {
    setFading(true);
    setTimeout(() => router.push(href), 200);
  }, [router]);

  return (
    <div className={`relative overflow-hidden bg-[#060410] transition-opacity duration-200 ${fading ? "opacity-0 scale-[0.99]" : "opacity-100"}`}>
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

      {/* Hero */}
      <div className="relative z-10 min-h-screen flex flex-col pb-20">
        {/* Nav — fades in first */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-riseIn" style={{ animationDelay: "0.1s" }}>
          <span className="text-lg font-light text-[#F2F0EB]/60 tracking-[0.3em] uppercase">
            Kairós
          </span>
          <div className="flex items-center gap-5">
            {user && (
              <Link href="/profile" className="text-sm text-[#F2F0EB]/25 hover:text-[#F2F0EB]/50 transition-colors btn-haptic">
                {locale === "zh" ? "我的" : "Profile"}
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Act 1: Taiji materializes from void — with parallax */}
          <div
            ref={taijiRef}
            className={`mb-14 lg:mb-16 animate-materialize ${taijiSpin ? "animate-compassSpin" : ""}`}
            style={{
              animationDelay: taijiSpin ? "0s" : "0.3s",
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          >
            <TaijiSvg size={160} />
          </div>

          {/* Act 2: Title rises — no typewriter, just a clean rise */}
          <div>
            <h1
              className="font-display text-[#F2F0EB] text-4xl sm:text-5xl lg:text-7xl font-bold tracking-[0.1em] max-w-4xl leading-[1.2] animate-riseIn"
              style={{ animationDelay: "1.2s", animationDuration: "0.8s" }}
            >
              {t("hero.title")}
            </h1>
            <p
              className="mt-2 text-[#F2F0EB]/35 text-sm sm:text-base tracking-widest animate-riseIn"
              style={{ animationDelay: "1.8s", animationDuration: "0.6s" }}
            >
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Act 3: Input appears */}
          <div className="mt-12 w-full max-w-xs mx-auto animate-riseIn" style={{ animationDelay: "2.4s" }}>
            <p className="text-[#F2F0EB]/20 text-[10px] mb-3 tracking-[0.2em] uppercase">
              {locale === "zh" ? "输入出生日期" : "Birth date"}
            </p>
            <input
              type="date"
              value={quickDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className={`w-full px-4 py-3 rounded-xl bg-[#F2F0EB]/[0.03] border text-[#F2F0EB]/80 text-center focus:outline-none transition-all duration-300 [color-scheme:dark] ${
                dateFlash ? "animate-goldenFlash" : "border-[#F2F0EB]/[0.08] focus:border-amber-400/30"
              }`}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Act 4: Preview card — staggered entrance */}
          {quickPreview && (
            <div className="mt-6 w-full max-w-xs mx-auto animate-cardExpand">
              <div className="bg-[#F2F0EB]/[0.02] border border-[#F2F0EB]/[0.06] rounded-2xl p-5 backdrop-blur-sm stagger-card">
                {/* Child 1: Header */}
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

                {/* Child 2: Description */}
                <p className="text-[13px] text-[#F2F0EB]/40 leading-relaxed mb-4">
                  {locale === "zh" ? quickPreview.dayMasterDesc : quickPreview.dayMasterDescEn}
                </p>

                {/* Child 3: Five elements bar — fills from left */}
                <div>
                  <div className="flex gap-0.5 h-1 rounded-full overflow-hidden mb-1.5">
                    {(["木", "火", "土", "金", "水"] as const).map((el, i) => {
                      const count = quickPreview.fiveElements[el];
                      const total = Object.values(quickPreview.fiveElements).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? (count / total) * 100 : 20;
                      return (
                        <div
                          key={el}
                          style={{
                            width: `${pct}%`,
                            backgroundColor: ELEMENT_COLORS[el],
                            animationDelay: `${400 + i * 100}ms`,
                          }}
                          className="animate-barFill opacity-50"
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[8px] text-[#F2F0EB]/20">
                    {(["木", "火", "土", "金", "水"] as const).map((el) => (
                      <span key={el}>{el} {quickPreview.fiveElements[el]}</span>
                    ))}
                  </div>
                </div>

                {/* Child 4: CTA — gold accent */}
                <button
                  onClick={() => handleNavigate(`/fortune?date=${quickDate}`)}
                  className="mt-4 block w-full py-3 rounded-xl text-sm text-center font-medium btn-haptic
                             border border-amber-400/20 text-amber-200/70
                             hover:bg-amber-400/[0.05] hover:text-amber-200/90 hover:border-amber-400/35
                             transition-all duration-300 cursor-pointer"
                >
                  {locale === "zh" ? "查看完整解读 →" : "Full Reading →"}
                </button>
              </div>
            </div>
          )}

          {/* CTA when no date */}
          {!quickPreview && (
            <button
              onClick={() => handleNavigate("/fortune")}
              className="mt-8 px-10 py-3.5 rounded-full text-sm font-medium tracking-wider btn-haptic cursor-pointer
                         border border-[#F2F0EB]/12 text-[#F2F0EB]/50
                         hover:bg-[#F2F0EB]/[0.04] hover:text-[#F2F0EB]/70 hover:border-[#F2F0EB]/20
                         transition-all duration-500 animate-riseIn"
              style={{ animationDelay: "3s" }}
            >
              {t("hero.cta")} →
            </button>
          )}

          <p className="text-[#F2F0EB]/12 text-[9px] mt-3 tracking-[0.15em] animate-riseIn" style={{ animationDelay: "3.3s" }}>
            {locale === "zh" ? "免费 · 无需注册 · 即时生成" : "Free · No signup · Instant"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#F2F0EB]/[0.04] py-6 px-6">
        <div className="max-w-sm mx-auto text-center">
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#F2F0EB]/15">
            <Link href="/about" className="hover:text-[#F2F0EB]/30 transition-colors btn-haptic">{locale === "zh" ? "关于" : "About"}</Link>
            <span className="text-[#F2F0EB]/[0.06]">·</span>
            <Link href="/learn" className="hover:text-[#F2F0EB]/30 transition-colors btn-haptic">{locale === "zh" ? "了解八字" : "Learn"}</Link>
            <span className="text-[#F2F0EB]/[0.06]">·</span>
            <Link href="/terms" className="hover:text-[#F2F0EB]/30 transition-colors btn-haptic">{t("footer.terms")}</Link>
            <span className="text-[#F2F0EB]/[0.06]">·</span>
            <Link href="/privacy" className="hover:text-[#F2F0EB]/30 transition-colors btn-haptic">{t("footer.privacy")}</Link>
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
