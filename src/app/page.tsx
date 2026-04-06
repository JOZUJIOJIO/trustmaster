"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { filterMasters } from "@/lib/db";
import type { Master } from "@/lib/types";
import MasterCard from "@/components/MasterCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { TypewriterText, useScrollReveal } from "@/components/MysticalEffects";
import StarfieldCanvas from "@/components/StarfieldCanvas";
import TaijiSvg from "@/components/TaijiSvg";
import TiltCard from "@/components/TiltCard";
import { useAuth } from "@/lib/supabase/auth-context";
import { calculateBazi, ELEMENT_EMOJI, ELEMENT_COLORS, type BaziChart } from "@/lib/bazi";

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
  const [quickDate, setQuickDate] = useState("");
  const { locale, t } = useLocale();
  const { user } = useAuth();
  useScrollReveal();

  // Instant BaZi preview from date input
  const quickPreview = useMemo<BaziChart | null>(() => {
    if (!quickDate) return null;
    try {
      const [y, m, d] = quickDate.split("-").map(Number);
      if (!y || !m || !d) return null;
      return calculateBazi(y, m, d, "午", "male");
    } catch { return null; }
  }, [quickDate]);

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

      {/* ===== Section 1 — Brand Story ===== */}
      <section className="relative z-10 py-20 lg:py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-amber-400/40 text-[10px] tracking-[0.4em] uppercase mb-6">
            {locale === "zh" ? "关于 Kairós" : "About Kairós"}
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold text-amber-100 leading-snug">
            {locale === "zh" ? "两种时间，一个答案" : "Two Kinds of Time, One Answer"}
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

      {/* ===== Section 2 — How It Works ===== */}
      <section className="relative z-10 py-20 lg:py-28 px-6">
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
              { step: "01", title: locale === "zh" ? "输入生辰" : "Enter Birth Date", desc: locale === "zh" ? "年月日时，四柱八字的起点" : "Year, month, day, hour — the four pillars begin here" },
              { step: "02", title: locale === "zh" ? "AI 排盘解读" : "AI Analysis", desc: locale === "zh" ? "融合子平真诠与现代 AI，秒出深度命盘" : "Classical methods meet modern AI for instant deep analysis" },
              { step: "03", title: locale === "zh" ? "获取洞见" : "Get Insights", desc: locale === "zh" ? "性格、事业、财运、关系——全面个性化解读" : "Personality, career, wealth, relationships — fully personalized" },
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

      {/* ===== Section 3 — Features ===== */}
      <section className="relative z-10 py-20 lg:py-28 px-6">
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
              { href: "/fortune", icon: "☯", title: locale === "zh" ? "八字命理" : "BaZi Analysis", desc: locale === "zh" ? "基于子平真诠的四柱排盘，确定性算法，无随机因素" : "Four Pillars chart based on classical methods, deterministic — no randomness" },
              { href: "/health", icon: "🌿", title: locale === "zh" ? "五行体质" : "TCM Constitution", desc: locale === "zh" ? "中医九种体质测评，AI 定制养生方案" : "Nine-type TCM assessment with AI-customized wellness plans" },
              { href: "/daily", icon: "📅", title: locale === "zh" ? "每日运势" : "Daily Insights", desc: locale === "zh" ? "个性化每日评分与宜忌指南" : "Personalized daily scores and guidance" },
              { href: "/compatibility", icon: "💑", title: locale === "zh" ? "双人合盘" : "Compatibility", desc: locale === "zh" ? "五行互补分析，关系兼容度评分" : "Five Elements harmony analysis and relationship scoring" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6 hover:border-amber-400/20 transition-colors group">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-amber-200 mb-2 group-hover:text-amber-100 transition-colors">{item.title}</h3>
                <p className="text-xs text-amber-100/40 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Section 4 — Trust Signals ===== */}
      <section className="relative z-10 py-20 lg:py-28 px-6">
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

      {/* ===== Section 5 — Testimonials ===== */}
      <section className="relative z-10 py-20 lg:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400/40 text-[10px] tracking-[0.4em] uppercase mb-6">
              {locale === "zh" ? "用户体验" : "User Stories"}
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-amber-100">
              {locale === "zh" ? "他们找到了自己的时刻" : "They Found Their Moment"}
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                quote: locale === "zh"
                  ? "一直对八字好奇但看不懂，Kairós 的 AI 解读终于让我理解了自己的命盘，尤其是事业方向的分析特别准。"
                  : "I was always curious about BaZi but couldn't understand it. Kairós finally helped me decode my chart — the career analysis was spot on.",
                name: locale === "zh" ? "林小姐" : "Ms. Lin",
                tag: locale === "zh" ? "产品经理 · 深圳" : "Product Manager · Shenzhen",
              },
              {
                quote: locale === "zh"
                  ? "体质测评结果出乎意料地准确，推荐的食疗方案我坚持了一个月，确实感觉身体轻松了很多。"
                  : "The constitution assessment was surprisingly accurate. I followed the diet plan for a month and genuinely felt the difference.",
                name: locale === "zh" ? "张先生" : "Mr. Zhang",
                tag: locale === "zh" ? "自由职业 · 曼谷" : "Freelancer · Bangkok",
              },
              {
                quote: locale === "zh"
                  ? "和伴侣做了合盘分析，终于理解了我们为什么在某些事情上总是意见不合，五行互补的视角很新颖。"
                  : "The compatibility reading helped us understand why we always clash on certain things. The five elements perspective was eye-opening.",
                name: locale === "zh" ? "王女士" : "Ms. Wang",
                tag: locale === "zh" ? "设计师 · 新加坡" : "Designer · Singapore",
              },
            ].map((item) => (
              <div key={item.name} className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6">
                <p className="text-sm text-amber-100/60 leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-amber-400/10">
                  <div className="text-sm font-semibold text-amber-200">{item.name}</div>
                  <div className="text-[10px] text-amber-200/30 mt-0.5">{item.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Section 6 — Masters ===== */}
      <section className="relative z-10 py-12 lg:py-16">
        <div className="text-center mb-6">
          <p className="text-amber-400/40 text-[10px] tracking-[0.2em]">{locale === "zh" ? "✦ 认 证 大 师 ✦" : "✦ CERTIFIED MASTERS ✦"}</p>
        </div>
        <div className="lg:max-w-6xl lg:mx-auto lg:px-6">
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
        </div>
      </section>

      {/* ===== Section 6 — Final CTA ===== */}
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

      {/* ===== Footer ===== */}
      <footer className="relative z-10 border-t border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <li><Link href="/learn" className="hover:text-amber-200/60 transition-colors">{locale === "zh" ? "了解八字" : "Learn BaZi"}</Link></li>
                <li><Link href="/about" className="hover:text-amber-200/60 transition-colors">{locale === "zh" ? "关于我们" : "About Us"}</Link></li>
                <li><Link href="/terms" className="hover:text-amber-200/60 transition-colors">{t("footer.terms")}</Link></li>
                <li><Link href="/privacy" className="hover:text-amber-200/60 transition-colors">{t("footer.privacy")}</Link></li>
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

      {/* Mobile bottom nav */}
      <div className="pb-20 lg:pb-0 relative z-10">
        <BottomNav />
      </div>
    </div>
  );
}
