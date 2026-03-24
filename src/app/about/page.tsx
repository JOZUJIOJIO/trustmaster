"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AboutPage() {
  const { locale } = useLocale();
  const isChinese = locale === "zh" || locale === "th";

  return (
    <div className="min-h-screen bg-[#12101c]">
      <header className="flex items-center justify-between px-4 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-amber-200/60 hover:text-amber-200 text-lg">←</Link>
          <span className="text-sm text-amber-200/60">{isChinese ? "关于我们" : "About"}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 pb-24">
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🔮</div>
          <h1 className="text-3xl font-bold text-gradient-gold">TrustMaster</h1>
          <p className="text-amber-200/40 text-sm mt-3">
            {isChinese ? "古老智慧，现代科技" : "Ancient Wisdom, Modern Technology"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Mission */}
          <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-amber-200 mb-3">
              {isChinese ? "我们的使命" : "Our Mission"}
            </h2>
            <p className="text-sm text-amber-100/50 leading-relaxed">
              {isChinese
                ? "TrustMaster 致力于将五千年东方智慧带给全世界。我们相信，古老的四柱命理系统蕴含着深刻的人生洞察——我们的使命是通过现代技术让这些智慧变得人人可及、通俗易懂。"
                : "TrustMaster is dedicated to bringing 5,000 years of Eastern wisdom to the world. We believe the ancient Four Pillars system contains profound life insights — our mission is to make this wisdom accessible and understandable through modern technology."}
            </p>
          </div>

          {/* Methodology */}
          <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-amber-200 mb-3">
              {isChinese ? "方法论基础" : "Our Methodology"}
            </h2>
            <p className="text-sm text-amber-100/50 leading-relaxed mb-3">
              {isChinese
                ? "我们的计算引擎基于以下经典著作和传统方法论："
                : "Our calculation engine is built on these classical texts and traditional methodologies:"}
            </p>
            <div className="space-y-2">
              {[
                { name: isChinese ? "《子平真诠》" : "Zi Ping Zhen Quan", desc: isChinese ? "四柱命理的经典理论基础" : "The foundational classic of Four Pillars theory" },
                { name: isChinese ? "《滴天髓》" : "Di Tian Sui", desc: isChinese ? "八字分析的核心推理框架" : "Core reasoning framework for BaZi analysis" },
                { name: isChinese ? "《穷通宝鉴》" : "Qiong Tong Bao Jian", desc: isChinese ? "五行调候的权威参考" : "Authoritative reference for Five Elements climate adjustment" },
                { name: isChinese ? "万年历算法" : "Perpetual Calendar Algorithm", desc: isChinese ? "精准的天干地支推算" : "Precise Stem-Branch calculations" },
              ].map((item) => (
                <div key={item.name} className="flex items-start gap-2.5 bg-white/[0.02] rounded-lg p-3 border border-white/5">
                  <span className="text-amber-400/40 text-xs mt-0.5">📖</span>
                  <div>
                    <div className="text-xs font-semibold text-amber-200/70">{item.name}</div>
                    <div className="text-[11px] text-amber-100/40">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-amber-200 mb-3">
              {isChinese ? "技术架构" : "Technology"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "⚙️", label: isChinese ? "确定性算法" : "Deterministic Engine", desc: isChinese ? "相同输入永远产生相同命盘" : "Same input always produces same chart" },
                { icon: "🤖", label: isChinese ? "AI 深度解读" : "AI Interpretation", desc: isChinese ? "基于真实数据的个性化洞察" : "Personalized insights from real data" },
                { icon: "🔒", label: isChinese ? "隐私保护" : "Privacy First", desc: isChinese ? "数据加密，不分享个人信息" : "Encrypted data, never shared" },
                { icon: "🌐", label: isChinese ? "多语言支持" : "Multilingual", desc: isChinese ? "中文、英语、泰语等" : "Chinese, English, Thai & more" },
              ].map((item) => (
                <div key={item.label} className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5 text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xs font-semibold text-amber-200/70">{item.label}</div>
                  <div className="text-[10px] text-amber-100/40 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-amber-200 mb-3">
              {isChinese ? "重要声明" : "Important Disclaimer"}
            </h2>
            <p className="text-sm text-amber-100/50 leading-relaxed">
              {isChinese
                ? "TrustMaster 提供的所有分析和洞察均由 AI 生成，仅供娱乐、自我反思和个人发展参考。我们不提供医疗、法律或财务建议。请勿仅凭本平台的分析做出重大人生决策。"
                : "All analysis and insights provided by TrustMaster are AI-generated for entertainment, self-reflection, and personal development purposes only. We do not provide medical, legal, or financial advice. Please do not make major life decisions based solely on our analysis."}
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-bold text-amber-200 mb-2">
              {isChinese ? "联系我们" : "Contact Us"}
            </h2>
            <p className="text-sm text-amber-100/50">support@trustmaster.app</p>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="/terms" className="text-xs text-amber-200/30 hover:text-amber-200/50 transition-colors underline">
                {isChinese ? "服务条款" : "Terms"}
              </Link>
              <Link href="/privacy" className="text-xs text-amber-200/30 hover:text-amber-200/50 transition-colors underline">
                {isChinese ? "隐私政策" : "Privacy"}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
