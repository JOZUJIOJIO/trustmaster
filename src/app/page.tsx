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
import { TypewriterText, AnimatedNumber, useScrollReveal } from "@/components/MysticalEffects";
import StarfieldCanvas from "@/components/StarfieldCanvas";
import TaijiSvg from "@/components/TaijiSvg";
import TiltCard from "@/components/TiltCard";
import { useAuth } from "@/lib/supabase/auth-context";

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
  const { locale, t } = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  useScrollReveal();

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
    return (
      <div className="relative overflow-hidden">
        {/* === Background — deep cosmic atmosphere === */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#060410]" />
          {/* Nebula layer 1 — deep purple core */}
          <div
            className="absolute inset-0 animate-drift"
            style={{
              background: "radial-gradient(ellipse 90% 70% at 25% 35%, rgba(60,20,120,0.18) 0%, transparent 55%)",
              animationDuration: "40s",
            }}
          />
          {/* Nebula layer 2 — warm gold cluster */}
          <div
            className="absolute inset-0 animate-drift"
            style={{
              background: "radial-gradient(ellipse 70% 55% at 75% 55%, rgba(140,80,20,0.12) 0%, transparent 50%)",
              animationDuration: "55s",
              animationDirection: "reverse",
            }}
          />
          {/* Nebula layer 3 — blue cosmic dust */}
          <div
            className="absolute inset-0 animate-drift"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(20,40,100,0.1) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(50,20,80,0.08) 0%, transparent 45%)",
              animationDuration: "70s",
            }}
          />
          {/* Milky Way band — faint diagonal stripe */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background: "linear-gradient(135deg, transparent 20%, rgba(200,180,150,1) 45%, rgba(200,180,150,0.6) 50%, rgba(200,180,150,1) 55%, transparent 80%)",
            }}
          />
          {/* Vignette — stronger for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
        </div>

        {/* Interactive starfield canvas */}
        <StarfieldCanvas />

        {/* Content */}
        <div className="relative z-10 min-h-[75vh] flex flex-col">
          {/* Top nav */}
          <nav className="flex items-center justify-between px-6 lg:px-12 py-4 animate-fadeIn" style={{ animationDuration: "1s" }}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl drop-shadow-lg">🔮</span>
              <span className="text-xl font-bold text-amber-100/90 tracking-widest uppercase drop-shadow-lg">
                Kairós
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href={user ? "/profile" : "/login"}
                className="flex items-center gap-1.5 text-sm text-amber-200/60 hover:text-amber-200 transition-colors"
              >
                {user ? (locale === "zh" ? "👤 我的" : "👤 Profile") : (locale === "zh" ? "登录" : "Sign in")}
              </Link>
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-4">
            {/* Taiji SVG — smaller, decorative */}
            <div className="mb-4 animate-fadeIn" style={{ animationDelay: "0.3s", animationDuration: "2s", animationFillMode: "both" }}>
              <TaijiSvg size={96} />
            </div>

            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-4 animate-fadeIn" style={{ animationDelay: "0.8s", animationDuration: "1.5s", animationFillMode: "both" }}>
              <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "1s" }} />
              <span className="text-amber-400/50 text-[10px] tracking-[0.4em] uppercase">
                Ancient Eastern Wisdom × AI
              </span>
              <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "1s" }} />
            </div>

            {/* Title — typewriter */}
            <h1 className="font-display text-gradient-gold text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.15] min-h-[1.2em]">
              <TypewriterText text={t("hero.title")} delay={1200} />
            </h1>

            <p className="mt-4 text-amber-100/50 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed animate-fadeIn"
               style={{ animationDelay: "3s", animationDuration: "1.5s", animationFillMode: "both" }}>
              {t("hero.subtitle")}
            </p>

            {/* Quick Fortune Entry */}
            <div className="mt-6 animate-fadeIn" style={{ animationDelay: "3.2s", animationDuration: "1s", animationFillMode: "both" }}>
              <p className="text-amber-200/30 text-xs mb-3 tracking-wider">{locale === "zh" ? "输入出生日期，秒出命盘" : "Enter birth date for instant chart"}</p>
              <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
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
              <p className="text-amber-200/15 text-[10px] mt-2">{locale === "zh" ? "免费 · 无需注册 · 即时生成" : "Free · No signup · Instant"}</p>
            </div>

            {/* CTA button */}
            <button
              onClick={() => quickDate ? handleQuickFortune() : setShowHero(false)}
              className="mt-8 group px-10 py-4 rounded-full font-semibold text-base lg:text-lg cursor-pointer
                         bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                         text-white border border-amber-500/30
                         shadow-[0_0_40px_rgba(217,119,6,0.2)] hover:shadow-[0_0_60px_rgba(217,119,6,0.35)]
                         hover:scale-105 transition-all duration-500 animate-glowPulse animate-fadeIn border-flow"
              style={{ animationDelay: "3.5s", animationFillMode: "both" }}
            >
              {t("hero.cta")} →
            </button>

            {/* Secondary links */}
            <div className="mt-5 flex items-center gap-6 animate-fadeIn" style={{ animationDelay: "4s", animationFillMode: "both" }}>
              <Link href="/learn" className="text-xs text-amber-200/30 hover:text-amber-200/60 transition-colors underline underline-offset-2">
                {locale === "zh" ? "了解八字" : "What is BaZi?"}
              </Link>
              <Link href="/about" className="text-xs text-amber-200/30 hover:text-amber-200/60 transition-colors underline underline-offset-2">
                {locale === "zh" ? "关于我们" : "About Us"}
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-amber-400/30 text-xs">
            ↓
          </div>
        </div>

        {/* ===== Scrollable Sections Below Hero ===== */}
        <div className="relative z-10">

          {/* Section 1 — Brand Story */}
          <section className="py-20 lg:py-28 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-amber-400/40 text-[10px] tracking-[0.4em] uppercase mb-6">
                {locale === "zh" ? "关于 Kairós" : "About Kairós"}
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-amber-100 leading-snug">
                {locale === "zh"
                  ? "两种时间，一个答案"
                  : "Two Kinds of Time, One Answer"}
              </h2>
              <div className="w-12 h-px bg-amber-400/30 mx-auto my-6" />
              <p className="text-amber-100/50 text-sm lg:text-base leading-relaxed">
                {locale === "zh"
                  ? "古希腊人区分两种时间：Chronos 是钟表上流逝的每一秒，Kairos 是命运转折的那一刻——稍纵即逝，抓住就能改变一切。"
                  : "The ancient Greeks distinguished two kinds of time: Chronos, the steady tick of every second; Kairos, the pivotal moment of fate — fleeting, yet transformative."}
              </p>
              <p className="text-amber-100/50 text-sm lg:text-base leading-relaxed mt-4">
                {locale === "zh"
                  ? "东方智慧称之为「天时」。八字命理，正是读懂这个瞬间的钥匙。"
                  : "In the East, it's called 'Tianshi' — heavenly timing. BaZi is the key to reading that moment."}
              </p>
            </div>
          </section>

          {/* Section 2 — How It Works */}
          <section className="py-20 lg:py-28 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-amber-400/40 text-[10px] tracking-[0.4em] uppercase mb-6">
                  {locale === "zh" ? "如何运作" : "How It Works"}
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold text-amber-100">
                  {locale === "zh" ? "三步，解读你的命盘" : "Three Steps to Your Reading"}
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {[
                  {
                    step: "01",
                    title: locale === "zh" ? "输入生辰" : "Enter Birth Date",
                    desc: locale === "zh" ? "年月日时，四柱八字的起点" : "Year, month, day, hour — the four pillars begin here",
                  },
                  {
                    step: "02",
                    title: locale === "zh" ? "AI 排盘解读" : "AI Analysis",
                    desc: locale === "zh" ? "融合子平真诠与现代 AI，秒出深度命盘" : "Classical methods meet modern AI for instant deep analysis",
                  },
                  {
                    step: "03",
                    title: locale === "zh" ? "获取洞见" : "Get Insights",
                    desc: locale === "zh" ? "性格、事业、财运、关系——全面个性化解读" : "Personality, career, wealth, relationships — fully personalized",
                  },
                ].map((item) => (
                  <div key={item.step} className="text-center lg:text-left">
                    <div className="text-3xl lg:text-4xl font-bold text-amber-400/15 mb-3">{item.step}</div>
                    <h3 className="text-base font-semibold text-amber-200 mb-2">{item.title}</h3>
                    <p className="text-sm text-amber-100/40 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3 — Features */}
          <section className="py-20 lg:py-28 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-amber-400/40 text-[10px] tracking-[0.4em] uppercase mb-6">
                  {locale === "zh" ? "核心能力" : "Core Features"}
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold text-amber-100">
                  {locale === "zh" ? "千年智慧，现代演绎" : "Ancient Wisdom, Modern Expression"}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: "☯",
                    title: locale === "zh" ? "八字命理" : "BaZi Analysis",
                    desc: locale === "zh" ? "基于子平真诠的四柱排盘，确定性算法，无随机因素" : "Four Pillars chart based on classical methods, deterministic — no randomness",
                  },
                  {
                    icon: "🌿",
                    title: locale === "zh" ? "五行体质" : "TCM Constitution",
                    desc: locale === "zh" ? "中医九种体质测评，AI 定制养生方案" : "Nine-type TCM assessment with AI-customized wellness plans",
                  },
                  {
                    icon: "📅",
                    title: locale === "zh" ? "每日运势" : "Daily Insights",
                    desc: locale === "zh" ? "个性化每日评分与宜忌指南" : "Personalized daily scores and guidance",
                  },
                  {
                    icon: "💑",
                    title: locale === "zh" ? "双人合盘" : "Compatibility",
                    desc: locale === "zh" ? "五行互补分析，关系兼容度评分" : "Five Elements harmony analysis and relationship scoring",
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6 hover:border-amber-400/20 transition-colors">
                    <div className="text-2xl mb-3">{item.icon}</div>
                    <h3 className="text-sm font-semibold text-amber-200 mb-2">{item.title}</h3>
                    <p className="text-xs text-amber-100/40 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4 — Trust Signals */}
          <section className="py-20 lg:py-28 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-8 text-center">
                {[
                  { value: "3000+", label: locale === "zh" ? "年历史传承" : "Years of Tradition" },
                  { value: "100%", label: locale === "zh" ? "确定性算法" : "Deterministic" },
                  { value: "24/7", label: locale === "zh" ? "AI 即时解读" : "Instant AI Readings" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-2xl lg:text-3xl font-bold text-amber-400/80">{item.value}</div>
                    <div className="text-[10px] lg:text-xs text-amber-200/30 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5 — Final CTA */}
          <section className="py-20 lg:py-28 px-6 text-center">
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-amber-100 mb-4">
                {locale === "zh" ? "你的时刻，就是现在" : "Your Moment Is Now"}
              </h2>
              <p className="text-sm text-amber-100/40 mb-8">
                {locale === "zh"
                  ? "免费开始，无需注册，即时生成你的命盘。"
                  : "Start free, no signup required, get your chart instantly."}
              </p>
              <button
                onClick={() => quickDate ? handleQuickFortune() : setShowHero(false)}
                className="px-10 py-4 rounded-full font-semibold text-base cursor-pointer
                           bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                           text-white border border-amber-500/30
                           shadow-[0_0_40px_rgba(217,119,6,0.2)] hover:shadow-[0_0_60px_rgba(217,119,6,0.35)]
                           hover:scale-105 transition-all duration-500"
              >
                {t("hero.cta")} →
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-amber-400/10 py-8 px-6 text-center">
            <p className="text-[10px] text-amber-200/20 tracking-wider">
              © 2026 Kairós. {t("disclaimer.text")}
            </p>
          </footer>
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
            <h2 className="font-display text-xl lg:text-2xl font-bold text-amber-100">
              {locale === "zh" ? "探索东方智慧" : "Explore Eastern Wisdom"}
            </h2>
            <p className="text-sm text-amber-200/30 mt-2">
              {locale === "zh" ? "选择适合你的分析工具" : "Choose the insight tool that fits you"}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { href: "/fortune", icon: "☯", title: locale === "zh" ? "八字分析" : "BaZi Analysis", desc: locale === "zh" ? "四柱命理 · AI 解读" : "Four Pillars · AI Reading", glow: "rgba(217,119,6,0.1)" },
              { href: "/health", icon: "🌿", title: locale === "zh" ? "体质测评" : "Health Assessment", desc: locale === "zh" ? "五行体质 · AI 养生" : "TCM Constitution · AI Wellness", glow: "rgba(34,197,94,0.1)" },
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

        {/* ===== Brand Story — Why Kairós ===== */}
        <section className="lg:max-w-6xl lg:mx-auto px-4 lg:px-6 pb-8">
          <div className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-amber-400/10">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-amber-100">{locale === "zh" ? "为什么叫 Kairós" : "Why Kairós"}</h3>
              <p className="text-amber-200/30 text-xs mt-1 tracking-wider">/ˈkaɪroʊs/</p>
            </div>

            <div className="max-w-lg mx-auto text-center mb-8">
              <p className="text-sm text-amber-100/60 leading-relaxed">
                {locale === "zh"
                  ? "古希腊人用两个词描述时间：Chronos 是钟表上流逝的每一秒；Kairos 则是命运转折的那一刻——稍纵即逝，抓住就能改变一切。"
                  : "Ancient Greeks had two words for time: Chronos, the steady tick of the clock; and Kairos, the fleeting moment when fate turns — seize it, and everything changes."}
              </p>
              <p className="text-sm text-amber-100/60 leading-relaxed mt-3">
                {locale === "zh"
                  ? "东方智慧同样相信：天时地利人和，汇于一瞬。八字命理，正是读懂这个瞬间的钥匙。"
                  : "Eastern wisdom shares this belief: when heaven, earth, and self align in one moment. BaZi is the key to reading that moment."}
              </p>
              <p className="text-sm text-amber-200/80 leading-relaxed mt-3 font-medium">
                {locale === "zh"
                  ? "Kairós 将千年东方命理与 AI 结合，帮你识别属于你的关键时刻。"
                  : "Kairós combines ancient Eastern wisdom with AI to help you recognize the moments that matter."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center border-t border-amber-400/10 pt-6">
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
        <div className="text-center py-6">
          <p className="text-amber-400/40 text-[10px] tracking-[0.2em]">{locale === "zh" ? "✦ 认 证 大 师 ✦" : "✦ CERTIFIED MASTERS ✦"}</p>
        </div>
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
                <p className="text-sm text-amber-200/30">hello@kairos.app</p>
              </div>
            </div>
            <div className="border-t border-amber-400/10 mt-8 pt-6 text-center text-xs text-amber-200/20">
              © 2026 Kairós. {t("footer.copyright")}.
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
