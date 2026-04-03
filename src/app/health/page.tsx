"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TiltCard from "@/components/TiltCard";

export default function HealthPage() {
  const { locale, t } = useLocale();

  const features = [
    { icon: "⬠", title: locale === "zh" ? "五行体质分析" : "Five Elements Analysis", desc: locale === "zh" ? "木火土金水平衡图谱" : "Wood, Fire, Earth, Metal, Water balance" },
    { icon: "🫀", title: locale === "zh" ? "脏腑健康地图" : "Organ Health Map", desc: locale === "zh" ? "五脏六腑状态评估" : "Five organ system assessment" },
    { icon: "🥗", title: locale === "zh" ? "个性化食疗" : "Diet Therapy", desc: locale === "zh" ? "宜忌食物 · 双语对照" : "Recommended & avoid foods" },
    { icon: "📅", title: locale === "zh" ? "四季调养" : "Seasonal Wellness", desc: locale === "zh" ? "春夏秋冬调养指南" : "Spring, Summer, Autumn, Winter guide" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0814]">
      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-[#0a0814]/80 backdrop-blur-md border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-200">{t("app.name")}</span>
            </Link>
          </div>
          <nav className="flex items-center gap-8 text-sm text-amber-200/40">
            <Link href="/" className="hover:text-amber-200 transition-colors">{t("nav.home")}</Link>
            <Link href="/fortune" className="hover:text-amber-200 transition-colors">✨ {t("nav.fortune")}</Link>
            <span className="text-amber-300 font-medium cursor-default">{t("nav.health")}</span>
            <Link href="/profile" className="hover:text-amber-200 transition-colors">{t("nav.profile")}</Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile Header */}
      <PageHeader title={t("health.title")} />

      {/* Hero */}
      <section className="px-4 lg:px-6 py-12 lg:py-20 text-center max-w-2xl mx-auto">
        <div className="text-5xl mb-4">🌿</div>
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="w-12 h-px bg-amber-400/30" />
          <span className="text-amber-400/40 text-[10px] tracking-[0.3em] uppercase">
            TCM × AI
          </span>
          <div className="w-12 h-px bg-amber-400/30" />
        </div>
        <h1 className="font-display text-3xl lg:text-5xl font-bold text-amber-100 mb-4">
          {t("health.title")}
        </h1>
        <p className="text-amber-200/50 text-sm lg:text-base mb-8">
          {t("health.subtitle")}
        </p>
        <Link
          href="/health/quiz"
          className="inline-block px-10 py-4 rounded-full font-semibold text-base cursor-pointer
                     bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white
                     border border-amber-500/30 shadow-[0_0_40px_rgba(217,119,6,0.2)]
                     hover:shadow-[0_0_60px_rgba(217,119,6,0.35)] hover:scale-105 transition-all duration-500"
        >
          {t("health.cta")} →
        </Link>
        <p className="text-amber-200/20 text-[10px] mt-3">{t("health.ctaDesc")}</p>
      </section>

      {/* Features */}
      <section className="px-4 lg:px-6 pb-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f) => (
            <TiltCard key={f.title} glowColor="rgba(217,119,6,0.08)">
              <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-4 h-full">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-bold text-amber-200">{f.title}</h3>
                <p className="text-[10px] text-amber-200/30 mt-1">{f.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 lg:px-6 pb-12 max-w-2xl mx-auto">
        <div className="bg-white/[0.02] rounded-2xl p-6 border border-amber-400/10">
          <h3 className="text-center text-sm font-bold text-amber-100 mb-6">
            {locale === "zh" ? "三步完成" : "How It Works"}
          </h3>
          <div className="flex items-start gap-4">
            {[
              { step: "1", label: locale === "zh" ? "回答问卷" : "Take Quiz", sub: "18 questions, 3 min" },
              { step: "2", label: locale === "zh" ? "AI 分析" : "AI Analysis", sub: "TCM + AI engine" },
              { step: "3", label: locale === "zh" ? "获取报告" : "Get Report", sub: "$4.90 one-time" },
            ].map((s) => (
              <div key={s.step} className="flex-1 text-center">
                <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-2 text-xs text-amber-200 font-bold">
                  {s.step}
                </div>
                <div className="text-xs font-semibold text-amber-200/80">{s.label}</div>
                <div className="text-[10px] text-amber-200/30 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-center pb-24 lg:pb-8 px-4">
        <p className="text-[10px] text-amber-200/15 max-w-md mx-auto">{t("health.disclaimer")}</p>
      </div>

      <BottomNav />
    </div>
  );
}
