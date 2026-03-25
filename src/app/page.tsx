"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { filterMasters } from "@/lib/db";
import type { Master } from "@/lib/types";
import MasterCard from "@/components/MasterCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { TypewriterText, GlowRing, AnimatedNumber, useScrollReveal } from "@/components/MysticalEffects";
import StarfieldCanvas from "@/components/StarfieldCanvas";
import TaijiSvg from "@/components/TaijiSvg";
import TiltCard from "@/components/TiltCard";

function MasterCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-gray-100">
      <div className="w-14 h-14 rounded-full skeleton-breath flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton-breath rounded w-32" />
        <div className="h-3 skeleton-breath rounded w-24" />
        <div className="h-3 skeleton-breath rounded w-40" />
      </div>
      <div className="space-y-1">
        <div className="h-4 skeleton-breath rounded w-12" />
        <div className="h-3 skeleton-breath rounded w-8" />
      </div>
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);
  const [quickDate, setQuickDate] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const { locale, t } = useLocale();
  const router = useRouter();
  useScrollReveal();

  // Scroll parallax for Hero
  useEffect(() => {
    if (!showHero) return;
    const handle = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [showHero]);

  const handleQuickFortune = useCallback(() => {
    if (!quickDate) return;
    router.push(`/fortune?date=${quickDate}`);
  }, [quickDate, router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    filterMasters(category, debouncedSearch).then((data) => {
      if (!cancelled) {
        setMasters(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [category, debouncedSearch]);

  const totalReviews = masters.reduce((sum, m) => sum + m.review_count, 0);
  const avgSatisfaction = masters.length
    ? Math.round(masters.reduce((sum, m) => sum + m.satisfaction_score, 0) / masters.length)
    : 0;

  // ===== Full-screen Hero Landing =====
  if (showHero) {
    const parallaxScale = Math.max(0.85, 1 - scrollY / 2000);
    const parallaxOpacity = Math.max(0, 1 - scrollY / 600);

    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* === Pure CSS Nebula Background === */}
        <div className="absolute inset-0">
          {/* Base dark */}
          <div className="absolute inset-0 bg-[#0a0814]" />
          {/* Nebula layer 1 — purple */}
          <div
            className="absolute inset-0 animate-drift"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 25% 30%, rgba(88,28,135,0.2) 0%, transparent 70%)",
              animationDuration: "25s",
            }}
          />
          {/* Nebula layer 2 — amber/gold */}
          <div
            className="absolute inset-0 animate-drift"
            style={{
              background: "radial-gradient(ellipse 70% 50% at 70% 60%, rgba(120,70,20,0.15) 0%, transparent 70%)",
              animationDuration: "30s",
              animationDirection: "reverse",
            }}
          />
          {/* Nebula layer 3 — blue */}
          <div
            className="absolute inset-0 animate-drift"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 80%, rgba(30,58,138,0.1) 0%, transparent 60%)",
              animationDuration: "20s",
              animationDelay: "-8s",
            }}
          />
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
        </div>

        {/* Interactive starfield canvas */}
        <StarfieldCanvas />

        {/* Breathing glow rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
          style={{ transform: `scale(${parallaxScale})`, opacity: parallaxOpacity }}>
          <GlowRing size={300} color="rgba(217, 119, 6, 0.06)" />
          <GlowRing size={500} color="rgba(139, 92, 246, 0.03)" />
        </div>

        {/* Content — with scroll parallax */}
        <div
          className="relative z-10 min-h-screen flex flex-col"
          style={{
            transform: `scale(${parallaxScale}) translateY(${-scrollY * 0.15}px)`,
            opacity: parallaxOpacity,
            transition: "transform 0.05s linear",
          }}
        >
          {/* Top nav */}
          <nav className="flex items-center justify-between px-6 lg:px-12 py-5 animate-fadeIn" style={{ animationDuration: "1s" }}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl drop-shadow-lg">🔮</span>
              <span className="text-xl font-bold text-amber-100/90 tracking-widest uppercase drop-shadow-lg">
                TrustMaster
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href="/fortune"
                className="hidden sm:flex items-center gap-1.5 text-sm text-amber-200/60 hover:text-amber-200 transition-colors"
              >
                ✨ {t("nav.fortune")}
              </Link>
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {/* Taiji SVG — centerpiece with mouse parallax */}
            <div className="mb-8 animate-fadeIn" style={{ animationDelay: "0.3s", animationDuration: "2s", animationFillMode: "both" }}>
              <TaijiSvg size={160} />
            </div>

            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-6 animate-fadeIn" style={{ animationDelay: "0.8s", animationDuration: "1.5s", animationFillMode: "both" }}>
              <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "1s" }} />
              <span className="text-amber-400/50 text-[10px] tracking-[0.4em] uppercase">
                Ancient Eastern Wisdom × AI
              </span>
              <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "1s" }} />
            </div>

            {/* Title — typewriter */}
            <h1 className="text-gradient-gold text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.15] min-h-[1.2em]">
              <TypewriterText text={t("hero.title")} delay={1200} />
            </h1>

            <p className="mt-6 text-amber-100/50 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed animate-fadeIn"
               style={{ animationDelay: "3s", animationDuration: "1.5s", animationFillMode: "both" }}>
              {t("hero.subtitle")}
            </p>

            {/* Quick Fortune Entry */}
            <div className="mt-10 animate-fadeIn" style={{ animationDelay: "3.2s", animationDuration: "1s", animationFillMode: "both" }}>
              <p className="text-amber-200/30 text-xs mb-3 tracking-wider">输入出生日期，秒出命盘</p>
              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  min="1940-01-01"
                  className="flex-1 bg-white/[0.06] border border-amber-400/20 hover:border-amber-400/30 rounded-full px-5 py-3 text-amber-100 text-sm text-center focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
                />
                <button
                  onClick={handleQuickFortune}
                  disabled={!quickDate}
                  className="px-6 py-3 rounded-full font-semibold text-sm cursor-pointer
                             bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white
                             border border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed
                             hover:shadow-[0_0_30px_rgba(217,119,6,0.25)] transition-all"
                >
                  开启 →
                </button>
              </div>
              <p className="text-amber-200/15 text-[10px] mt-2">免费 · 无需注册 · 即时生成</p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 lg:gap-12 mt-12 animate-fadeIn"
                 style={{ animationDelay: "3.5s", animationDuration: "1s", animationFillMode: "both" }}>
              {[
                { value: loading ? 0 : masters.length, label: t("stats.masters"), dur: 2000 },
                { value: loading ? 0 : totalReviews, label: t("stats.reviews"), dur: 2500 },
                { value: loading ? 0 : avgSatisfaction, label: t("stats.satisfaction"), dur: 2000, suffix: "%" },
              ].map((stat, i) => (
                <div key={i} className="text-center flex items-center gap-8 lg:gap-12">
                  {i > 0 && <div className="w-px h-10 bg-amber-400/15 -ml-8 lg:-ml-12" />}
                  <div>
                    <div className="text-2xl lg:text-3xl font-bold text-amber-300 drop-shadow-lg">
                      {loading ? "--" : <><AnimatedNumber value={stat.value} duration={stat.dur} />{stat.suffix || ""}</>}
                    </div>
                    <div className="text-[10px] lg:text-xs text-amber-200/40 mt-1 tracking-wider uppercase">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <button
              onClick={() => setShowHero(false)}
              className="mt-14 group px-10 py-4 rounded-full font-semibold text-base lg:text-lg cursor-pointer
                         bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                         text-white border border-amber-500/30
                         shadow-[0_0_40px_rgba(217,119,6,0.2)] hover:shadow-[0_0_60px_rgba(217,119,6,0.35)]
                         hover:scale-105 transition-all duration-500 animate-glowPulse animate-fadeIn border-flow"
              style={{ animationDelay: "4s", animationFillMode: "both" }}
            >
              {t("hero.cta")} →
            </button>

            {/* Secondary links */}
            <div className="mt-8 flex items-center gap-6 animate-fadeIn" style={{ animationDelay: "4.5s", animationFillMode: "both" }}>
              <Link href="/learn" className="text-xs text-amber-200/30 hover:text-amber-200/60 transition-colors underline underline-offset-2">
                {locale === "zh" ? "了解八字" : "What is BaZi?"}
              </Link>
              <Link href="/about" className="text-xs text-amber-200/30 hover:text-amber-200/60 transition-colors underline underline-offset-2">
                {locale === "zh" ? "关于我们" : "About Us"}
              </Link>
            </div>

            {/* Scroll hint */}
            <div className="mt-16 animate-bounceDown animate-fadeIn"
                 style={{ animationDelay: "5s", animationFillMode: "both" }}>
              <div className="flex items-center gap-4 text-amber-400/20 text-lg">
                <span>☯</span><span>✦</span><span className="text-xl">↓</span><span>✦</span><span>☸</span>
              </div>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="text-center pb-6 lg:pb-8">
            <p className="text-[10px] text-amber-200/20 tracking-wider">
              {t("disclaimer.text")}
            </p>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden relative z-10">
          <BottomNav />
        </div>
      </div>
    );
  }

  // ===== Main app view (after CTA click) — DARK THEME =====
  return (
    <div className="min-h-screen page-enter bg-[#0a0814]">
      {/* Fixed starfield background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <StarfieldCanvas />
      </div>

      {/* PC Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-[#0a0814]/80 backdrop-blur-md border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHero(true)} className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-200">{t("app.name")}</span>
            </button>
          </div>
          <nav className="flex items-center gap-8 text-sm text-amber-200/40">
            <span className="text-amber-300 font-medium cursor-default">{t("nav.home")}</span>
            <a href="/fortune" className="hover:text-amber-200 transition-colors">✨ {t("nav.fortune")}</a>
            <a href="/favorites" className="hover:text-amber-200 transition-colors">{t("nav.favorites")}</a>
            <a href="/profile" className="hover:text-amber-200 transition-colors">{t("nav.profile")}</a>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-[#0a0814]/90 backdrop-blur-md px-4 pt-6 pb-2 border-b border-amber-400/10">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowHero(true)} className="cursor-pointer">
            <h1 className="text-xl font-bold text-amber-200">{t("app.name")}</h1>
            <p className="text-xs text-amber-200/40 mt-0.5">{t("app.tagline")}</p>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="relative z-10">
        {/* ===== Feature Cards Section — Dark 3D Tilt ===== */}
        <section className="lg:max-w-6xl lg:mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-amber-100">
              {locale === "zh" ? "探索东方智慧" : "Explore Eastern Wisdom"}
            </h2>
            <p className="text-sm text-amber-200/30 mt-2">
              {locale === "zh" ? "选择适合你的分析工具" : "Choose the insight tool that fits you"}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { href: "/fortune", icon: "☯", title: locale === "zh" ? "八字分析" : "BaZi Analysis", desc: locale === "zh" ? "四柱命理 · AI 解读" : "Four Pillars · AI Reading", glow: "rgba(217,119,6,0.1)" },
              { href: "/daily", icon: "📅", title: locale === "zh" ? "每日运势" : "Daily Insights", desc: locale === "zh" ? "个性化评分 · 宜忌" : "Personal Scores · Guidance", glow: "rgba(59,130,246,0.1)" },
              { href: "/compatibility", icon: "💑", title: locale === "zh" ? "双人合盘" : "Compatibility", desc: locale === "zh" ? "五行互补 · 兼容度" : "Elements Match · Score", glow: "rgba(139,92,246,0.1)" },
              { href: "/learn", icon: "📖", title: locale === "zh" ? "了解八字" : "Learn BaZi", desc: locale === "zh" ? "3000年东方智慧" : "3,000 Years of Wisdom", glow: "rgba(34,197,94,0.1)" },
            ].map((item) => (
              <TiltCard key={item.href} glowColor={item.glow}>
                <Link
                  href={item.href}
                  className="block bg-white/[0.03] border border-amber-400/10 hover:border-amber-400/20 rounded-2xl p-4 lg:p-5 group h-full transition-colors"
                >
                  <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
                  <h3 className="text-sm lg:text-base font-bold text-amber-200 group-hover:text-amber-100 transition-colors">{item.title}</h3>
                  <p className="text-[10px] lg:text-xs text-amber-200/30 mt-1">{item.desc}</p>
                </Link>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ===== Trust Section — Dark ===== */}
        <section className="lg:max-w-6xl lg:mx-auto px-4 lg:px-6 pb-8">
          <div className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-amber-400/10">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-amber-100">{locale === "zh" ? "为什么选择 TrustMaster" : "Why TrustMaster"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: "⚙️", title: locale === "zh" ? "精准算法" : "Precise Engine", desc: locale === "zh" ? "确定性计算，无随机" : "Deterministic, no randomness" },
                { icon: "📖", title: locale === "zh" ? "经典方法论" : "Classical Methods", desc: locale === "zh" ? "子平真诠 · 滴天髓" : "Zi Ping Zhen Quan" },
                { icon: "🤖", title: locale === "zh" ? "AI 增强解读" : "AI-Enhanced", desc: locale === "zh" ? "深度个性化分析" : "Deep personalized insights" },
              ].map((item) => (
                <div key={item.title} className="scroll-reveal">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs font-semibold text-amber-200/80">{item.title}</div>
                  <div className="text-[10px] text-amber-200/30 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Masters Section — Dark ===== */}
        <main id="masters" className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:pb-10">
          <div className="lg:bg-white/[0.02] lg:rounded-2xl lg:border lg:border-amber-400/10 lg:overflow-hidden">
            <div className="lg:flex lg:items-center lg:gap-4 lg:p-6 lg:border-b lg:border-amber-400/10">
              <div className="lg:flex-1">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <CategoryFilter selected={category} onSelect={setCategory} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-amber-200/70 px-4 py-3 lg:px-6 lg:text-base">
                {t("masters.popular")}
              </h2>

              {loading ? (
                <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <MasterCardSkeleton key={i} />
                  ))}
                </div>
              ) : masters.length > 0 ? (
                <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3">
                  {masters.map((master) => (
                    <MasterCard key={master.id} master={master} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-amber-200/30 text-sm">
                  {t("masters.notFound")}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer — Dark */}
        <footer className="hidden lg:block border-t border-amber-400/10 mt-16">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔮</span>
                  <span className="text-lg font-bold text-amber-200">{t("app.name")}</span>
                </div>
                <p className="text-sm text-amber-200/30 leading-relaxed">{t("footer.desc")}</p>
              </div>
              <div>
                <h4 className="text-amber-200 font-semibold text-sm mb-3">{t("footer.links")}</h4>
                <ul className="space-y-2 text-sm text-amber-200/30">
                  <li><a href="/terms" className="hover:text-amber-200/60 transition-colors">{t("footer.terms")}</a></li>
                  <li><a href="/privacy" className="hover:text-amber-200/60 transition-colors">{t("footer.privacy")}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-amber-200 font-semibold text-sm mb-3">{t("footer.contact")}</h4>
                <p className="text-sm text-amber-200/30">support@trustmaster.app</p>
              </div>
            </div>
            <div className="border-t border-amber-400/10 mt-8 pt-6 text-center text-xs text-amber-200/20">
              © 2026 TrustMaster. {t("footer.copyright")}.
            </div>
          </div>
        </footer>
      </div>

      <div className="pb-20 lg:pb-0 relative z-10">
        <BottomNav />
      </div>
    </div>
  );
}
