"use client";

import { useState, useEffect, useCallback } from "react";
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

function MasterCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-gray-100 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-40" />
      </div>
      <div className="space-y-1">
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-3 bg-gray-200 rounded w-8" />
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
  useScrollReveal();

  const handleQuickFortune = useCallback(() => {
    if (!quickDate) return;
    // Navigate to fortune page with pre-filled date
    router.push(`/fortune?date=${quickDate}`);
  }, [quickDate, router]);

  // Debounce search input by 300ms
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
      <div className="relative min-h-screen overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fadeIn"
          style={{ backgroundImage: "url('/hero-zen.jpg')", animationDuration: "2s" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Interactive starfield canvas — particles + mouse connections */}
        <StarfieldCanvas />

        {/* Breathing glow around center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]">
          <GlowRing size={300} color="rgba(217, 119, 6, 0.08)" />
          <GlowRing size={500} color="rgba(139, 92, 246, 0.04)" />
        </div>

        {/* Content — above canvas */}
        <div className="relative z-10 min-h-screen flex flex-col">
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

          {/* Main content - centered */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {/* Decorative line — animated reveal */}
            <div className="flex items-center gap-3 mb-8 animate-fadeIn" style={{ animationDelay: "0.5s", animationDuration: "1.5s", animationFillMode: "both" }}>
              <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "0.8s" }} />
              <span className="text-amber-400/60 text-xs tracking-[0.3em] uppercase">
                ☸ Ancient Eastern Wisdom ☸
              </span>
              <div className="w-12 h-px bg-amber-400/40 animate-reveal" style={{ animationDelay: "0.8s" }} />
            </div>

            {/* Title — typewriter effect */}
            <h1 className="text-gradient-gold text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.15] min-h-[1.2em]">
              <TypewriterText text={t("hero.title")} delay={1000} />
            </h1>

            <p className="mt-6 text-amber-100/50 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed animate-fadeIn"
               style={{ animationDelay: "3s", animationDuration: "1.5s", animationFillMode: "both" }}>
              {t("hero.subtitle")}
            </p>

            {/* Quick Fortune Entry — zero friction */}
            <div className="mt-10 animate-fadeIn" style={{ animationDelay: "3.2s", animationDuration: "1s", animationFillMode: "both" }}>
              <p className="text-amber-200/30 text-xs mb-3 tracking-wider">输入出生日期，秒出命盘</p>
              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  min="1940-01-01"
                  className="flex-1 bg-white/[0.06] border border-amber-400/20 hover:border-amber-400/30 rounded-full px-5 py-3 text-amber-100 text-sm text-center focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all placeholder:text-amber-200/20"
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

            {/* Stats row — animated counters */}
            <div className="flex items-center gap-8 lg:gap-12 mt-12 animate-fadeIn"
                 style={{ animationDelay: "3.5s", animationDuration: "1s", animationFillMode: "both" }}>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-amber-300 drop-shadow-lg">
                  {loading ? "--" : <AnimatedNumber value={masters.length} duration={2000} />}
                </div>
                <div className="text-[10px] lg:text-xs text-amber-200/40 mt-1 tracking-wider uppercase">
                  {t("stats.masters")}
                </div>
              </div>
              <div className="w-px h-10 bg-amber-400/15" />
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-amber-300 drop-shadow-lg">
                  {loading ? "--" : <AnimatedNumber value={totalReviews} duration={2500} />}
                </div>
                <div className="text-[10px] lg:text-xs text-amber-200/40 mt-1 tracking-wider uppercase">
                  {t("stats.reviews")}
                </div>
              </div>
              <div className="w-px h-10 bg-amber-400/15" />
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-amber-300 drop-shadow-lg">
                  {loading ? "--" : <><AnimatedNumber value={avgSatisfaction} duration={2000} />%</>}
                </div>
                <div className="text-[10px] lg:text-xs text-amber-200/40 mt-1 tracking-wider uppercase">
                  {t("stats.satisfaction")}
                </div>
              </div>
            </div>

            {/* CTA button — animated entrance + glow pulse */}
            <button
              onClick={() => setShowHero(false)}
              className="mt-14 group px-10 py-4 rounded-full font-semibold text-base lg:text-lg cursor-pointer
                         bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                         text-white border border-amber-500/30
                         shadow-[0_0_40px_rgba(217,119,6,0.2)] hover:shadow-[0_0_60px_rgba(217,119,6,0.35)]
                         hover:scale-105 transition-all duration-500 animate-glowPulse animate-fadeIn"
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

            {/* Scroll hint — bounce animation */}
            <div className="mt-16 animate-bounceDown animate-fadeIn"
                 style={{ animationDelay: "5s", animationFillMode: "both" }}>
              <div className="flex items-center gap-4 text-amber-400/20 text-lg">
                <span>☯</span>
                <span>✦</span>
                <span className="text-xl">↓</span>
                <span>✦</span>
                <span>☸</span>
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

  // ===== Main app view (after CTA click) =====
  return (
    <div className="min-h-screen page-enter">
      {/* PC Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHero(true)} className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-900">{t("app.name")}</span>
            </button>
          </div>
          <nav className="flex items-center gap-8 text-sm text-gray-600">
            <span className="text-amber-800 font-medium cursor-default">{t("nav.home")}</span>
            <a href="/fortune" className="hover:text-amber-700 transition-colors">✨ {t("nav.fortune")}</a>
            <a href="/favorites" className="hover:text-amber-700 transition-colors">{t("nav.favorites")}</a>
            <a href="/profile" className="hover:text-amber-700 transition-colors">{t("nav.profile")}</a>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-b from-amber-50 to-white px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowHero(true)} className="cursor-pointer">
            <h1 className="text-xl font-bold text-amber-900">{t("app.name")}</h1>
            <p className="text-xs text-amber-700 mt-0.5">{t("app.tagline")}</p>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* ===== Feature Cards Section ===== */}
      <section className="lg:max-w-6xl lg:mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="text-center mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            {locale === "zh" ? "探索东方智慧" : "Explore Eastern Wisdom"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {locale === "zh" ? "选择适合你的分析工具" : "Choose the insight tool that fits you"}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { href: "/fortune", icon: "☯", title: locale === "zh" ? "八字分析" : "BaZi Analysis", desc: locale === "zh" ? "四柱命理 · AI 解读" : "Four Pillars · AI Reading", color: "from-amber-50 to-orange-50 border-amber-200/50", textColor: "text-amber-900" },
            { href: "/daily", icon: "📅", title: locale === "zh" ? "每日运势" : "Daily Insights", desc: locale === "zh" ? "个性化评分 · 宜忌" : "Personal Scores · Guidance", color: "from-blue-50 to-indigo-50 border-blue-200/50", textColor: "text-blue-900" },
            { href: "/compatibility", icon: "💑", title: locale === "zh" ? "双人合盘" : "Compatibility", desc: locale === "zh" ? "五行互补 · 兼容度" : "Elements Match · Score", color: "from-purple-50 to-pink-50 border-purple-200/50", textColor: "text-purple-900" },
            { href: "/learn", icon: "📖", title: locale === "zh" ? "了解八字" : "Learn BaZi", desc: locale === "zh" ? "3000年东方智慧" : "3,000 Years of Wisdom", color: "from-emerald-50 to-teal-50 border-emerald-200/50", textColor: "text-emerald-900" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 lg:p-5 border hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
            >
              <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
              <h3 className={`text-sm lg:text-base font-bold ${item.textColor} group-hover:opacity-80 transition-opacity`}>{item.title}</h3>
              <p className="text-[10px] lg:text-xs text-gray-500 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Testimonial / Trust Section ===== */}
      <section className="lg:max-w-6xl lg:mx-auto px-4 lg:px-6 pb-8">
        <div className="bg-gradient-to-r from-amber-50/50 via-white to-amber-50/50 rounded-2xl p-6 lg:p-8 border border-amber-100/50">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">{locale === "zh" ? "为什么选择 TrustMaster" : "Why TrustMaster"}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">⚙️</div>
              <div className="text-xs font-semibold text-gray-800">{locale === "zh" ? "精准算法" : "Precise Engine"}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{locale === "zh" ? "确定性计算，无随机" : "Deterministic, no randomness"}</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📖</div>
              <div className="text-xs font-semibold text-gray-800">{locale === "zh" ? "经典方法论" : "Classical Methods"}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{locale === "zh" ? "子平真诠 · 滴天髓" : "Zi Ping Zhen Quan"}</div>
            </div>
            <div>
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-xs font-semibold text-gray-800">{locale === "zh" ? "AI 增强解读" : "AI-Enhanced"}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{locale === "zh" ? "深度个性化分析" : "Deep personalized insights"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Masters Section ===== */}
      <main id="masters" className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:pb-10">
        <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:overflow-hidden">
          <div className="lg:flex lg:items-center lg:gap-4 lg:p-6 lg:border-b lg:border-gray-100">
            <div className="lg:flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800 px-4 py-3 lg:px-6 lg:text-base">
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
              <div className="text-center py-12 text-gray-400 text-sm">
                {t("masters.notFound")}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PC Footer */}
      <footer className="hidden lg:block bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔮</span>
                <span className="text-lg font-bold text-white">{t("app.name")}</span>
              </div>
              <p className="text-sm leading-relaxed">{t("footer.desc")}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">{t("footer.links")}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">{t("footer.contact")}</h4>
              <p className="text-sm">support@trustmaster.app</p>
              <p className="text-sm mt-1">Bangkok, Thailand</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
            © 2026 TrustMaster. {t("footer.copyright")}.
          </div>
        </div>
      </footer>

      <div className="pb-20 lg:pb-0">
        <BottomNav />
      </div>
    </div>
  );
}
