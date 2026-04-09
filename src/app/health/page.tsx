"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TiltCard from "@/components/TiltCard";
import { useTheme } from "@/lib/ThemeContext";
import { themeTokens } from "@/lib/theme-tokens";

export default function HealthPage() {
  const { locale, t } = useLocale();
  const { theme } = useTheme();
  const tk = themeTokens[theme];

  const features = [
    { icon: "⬠", title: locale === "zh" ? "五行体质分析" : "Five Elements Analysis", desc: locale === "zh" ? "木火土金水平衡图谱" : "Wood, Fire, Earth, Metal, Water balance" },
    { icon: "🫀", title: locale === "zh" ? "脏腑健康地图" : "Organ Health Map", desc: locale === "zh" ? "五脏六腑状态评估" : "Five organ system assessment" },
    { icon: "🥗", title: locale === "zh" ? "个性化食疗" : "Diet Therapy", desc: locale === "zh" ? "宜忌食物 · 双语对照" : "Recommended & avoid foods" },
    { icon: "📅", title: locale === "zh" ? "四季调养" : "Seasonal Wellness", desc: locale === "zh" ? "春夏秋冬调养指南" : "Spring, Summer, Autumn, Winter guide" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme === "cosmic"
          ? "#0a0814"
          : "linear-gradient(180deg, #E8E6F0 0%, #F2F0EB 40%, #F8F5EE 100%)",
      }}
    >
      {/* Desktop Header */}
      <header className={`hidden lg:block sticky top-0 z-50 backdrop-blur-md border-b ${tk.accentBorder}`} style={{ backgroundColor: theme === "cosmic" ? "rgba(10,8,20,0.8)" : "rgba(242,240,235,0.8)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className={`text-xl font-bold ${tk.accent}`}>{t("app.name")}</span>
            </Link>
          </div>
          <nav className={`flex items-center gap-8 text-sm ${tk.label}`}>
            <Link href="/" className={`hover:${tk.text1} transition-colors`}>{t("nav.home")}</Link>
            <Link href="/fortune" className={`hover:${tk.text1} transition-colors`}>✨ {t("nav.fortune")}</Link>
            <span className={`${theme === "cosmic" ? "text-amber-300" : "text-amber-700"} font-medium cursor-default`}>{t("nav.health")}</span>
            <Link href="/profile" className={`hover:${tk.text1} transition-colors`}>{t("nav.profile")}</Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile Header */}
      <header className={`lg:hidden flex items-center justify-between h-12 px-4 border-b ${tk.accentBorder} sticky top-0 backdrop-blur-md z-50`} style={{ backgroundColor: theme === "cosmic" ? "rgba(10,8,20,0.9)" : "rgba(242,240,235,0.9)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className={`${tk.label} hover:opacity-80 text-lg active:scale-95 transition-transform p-2.5 -ml-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center`}>←</Link>
          <span className={`text-[15px] font-semibold ${tk.text1}`}>{t("health.title")}</span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Hero */}
      <section className="px-4 lg:px-6 py-12 lg:py-20 text-center max-w-2xl mx-auto">
        <div className="text-5xl mb-4">🌿</div>
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className={`w-12 h-px ${theme === "cosmic" ? "bg-amber-400/30" : "bg-amber-600/30"}`} />
          <span className={`${tk.accentMuted} text-[10px] tracking-[0.3em] uppercase`}>
            TCM × AI
          </span>
          <div className={`w-12 h-px ${theme === "cosmic" ? "bg-amber-400/30" : "bg-amber-600/30"}`} />
        </div>
        <h1 className={`font-display text-3xl lg:text-5xl font-bold ${tk.text1} mb-4`}>
          {t("health.title")}
        </h1>
        <p className={`${tk.text2} text-sm lg:text-base mb-8`}>
          {t("health.subtitle")}
        </p>
        <Link
          href="/health/quiz"
          className={`inline-block px-10 py-4 rounded-full font-semibold text-base cursor-pointer
                     ${tk.ctaPrimary}
                     border ${theme === "cosmic" ? "border-amber-500/30" : "border-amber-500/40"} shadow-[0_0_40px_rgba(217,119,6,0.2)]
                     hover:shadow-[0_0_60px_rgba(217,119,6,0.35)] hover:scale-105 transition-all duration-500`}
        >
          {t("health.cta")} →
        </Link>
        <p className={`${tk.text3} text-[10px] mt-3`}>{t("health.ctaDesc")}</p>
      </section>

      {/* Features */}
      <section className="px-4 lg:px-6 pb-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f) => (
            <TiltCard key={f.title} glowColor="rgba(217,119,6,0.08)">
              <div className={`${tk.card} border ${tk.accentBorder} rounded-2xl p-4 h-full`}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className={`text-sm font-bold ${tk.accent}`}>{f.title}</h3>
                <p className={`text-[10px] ${tk.text3} mt-1`}>{f.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 lg:px-6 pb-12 max-w-2xl mx-auto">
        <div className={`${tk.sectionBg} rounded-2xl p-6 border ${tk.accentBorder}`}>
          <h3 className={`text-center text-sm font-bold ${tk.text1} mb-6`}>
            {locale === "zh" ? "三步完成" : "How It Works"}
          </h3>
          <div className="flex items-start gap-4">
            {[
              { step: "1", label: locale === "zh" ? "回答问卷" : "Take Quiz", sub: "18 questions, 3 min" },
              { step: "2", label: locale === "zh" ? "AI 分析" : "AI Analysis", sub: "TCM + AI engine" },
              { step: "3", label: locale === "zh" ? "获取报告" : "Get Report", sub: "$4.90 one-time" },
            ].map((s) => (
              <div key={s.step} className="flex-1 text-center">
                <div className={`w-8 h-8 rounded-full ${theme === "cosmic" ? "bg-amber-600/20 border-amber-500/20" : "bg-amber-600/15 border-amber-500/25"} border flex items-center justify-center mx-auto mb-2 text-xs ${tk.accent} font-bold`}>
                  {s.step}
                </div>
                <div className={`text-xs font-semibold ${tk.accent}`}>{s.label}</div>
                <div className={`text-[10px] ${tk.text3} mt-0.5`}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-center pb-24 lg:pb-8 px-4">
        <p className={`text-[10px] ${tk.footerText} max-w-md mx-auto`}>{t("health.disclaimer")}</p>
      </div>

      <BottomNav />
    </div>
  );
}
