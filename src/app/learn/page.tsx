"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const sections = [
  {
    icon: "☯",
    title: "What is BaZi?",
    titleZh: "什么是八字？",
    content: "BaZi (八字), also known as the Four Pillars of Destiny, is a 3,000-year-old Chinese metaphysical system that maps the energetic blueprint of your life using the exact moment of your birth. Each person's chart consists of four 'pillars' — Year, Month, Day, and Hour — each containing a Heavenly Stem and an Earthly Branch.",
    contentZh: "八字，又称四柱命理，是一套拥有 3000 年历史的中国哲学分析体系。它通过出生时刻的年、月、日、时四柱——每柱包含一个天干和一个地支——来绘制你人生的能量蓝图。",
  },
  {
    icon: "🌳",
    title: "The Five Elements",
    titleZh: "五行是什么？",
    content: "Everything in the BaZi system is built on Five Elements: Wood (木), Fire (火), Earth (土), Metal (金), and Water (水). These elements interact through two cycles: the Generation Cycle (Wood → Fire → Earth → Metal → Water → Wood) where each element nourishes the next, and the Control Cycle where each element restrains another. Your chart's balance of these elements reveals your strengths, challenges, and life patterns.",
    contentZh: "八字系统建立在五行基础上：木、火、土、金、水。五行通过相生（木→火→土→金→水→木）和相克两个循环互相作用。你命盘中五行的平衡揭示了你的优势、挑战和人生规律。",
  },
  {
    icon: "🎯",
    title: "The Day Master",
    titleZh: "什么是日主？",
    content: "The Day Master (日主) is the Heavenly Stem of your Day Pillar — it represents YOU. All other elements in your chart are analyzed in relation to your Day Master. For example, if your Day Master is Wood (甲 or 乙), Fire represents your talent and expression, Earth represents your wealth opportunities, Metal represents your authority figures, and Water represents your mentors and wisdom.",
    contentZh: "日主是日柱的天干——代表「你自己」。命盘中所有其他元素都以日主为参照进行分析。比如日主为木的人，火代表才华，土代表财运，金代表权力，水代表智慧和贵人。",
  },
  {
    icon: "🔮",
    title: "Ten Gods (十神)",
    titleZh: "什么是十神？",
    content: "The Ten Gods describe the relationship between your Day Master and every other element in your chart. They include: Companion (比肩), Rob Wealth (劫财), Eating God (食神), Hurting Officer (伤官), Direct/Indirect Wealth (正财/偏财), Direct Officer/Seven Killings (正官/七杀), and Direct/Indirect Seal (正印/偏印). Each God reveals a different aspect of your life — career, relationships, wealth, creativity, and more.",
    contentZh: "十神描述日主与命盘中其他元素的关系：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印。每个十神揭示人生的不同面向——事业、关系、财富、创造力等。",
  },
  {
    icon: "📅",
    title: "Luck Cycles (大运)",
    titleZh: "什么是大运？",
    content: "Your life unfolds in 10-year Luck Cycles (大运). Each cycle brings a different elemental energy that interacts with your natal chart, creating periods of opportunity or challenge. Understanding your current luck cycle helps you make better decisions — when to push forward, when to consolidate, and when to prepare for change.",
    contentZh: "人生按每十年一个「大运」周期展开。每个大运带来不同的五行能量，与你的先天命盘交互，形成机遇期或挑战期。了解当前大运帮助你做出更好的决策——何时进取、何时守成、何时准备变化。",
  },
  {
    icon: "🤖",
    title: "How AI Enhances Traditional Analysis",
    titleZh: "AI 如何增强传统分析？",
    content: "TrustMaster combines precise traditional calculations with AI interpretation. Our engine computes your Four Pillars, Five Elements, Ten Gods, and Luck Cycles using deterministic algorithms — no randomness, 100% reproducible. Then AI synthesizes these data points into personalized, easy-to-understand insights, bridging the gap between ancient wisdom and modern comprehension.",
    contentZh: "TrustMaster 将精准的传统计算与 AI 解读相结合。我们的引擎使用确定性算法计算四柱、五行、十神和大运——没有随机性，100% 可复现。然后 AI 将这些数据综合成个性化的、通俗易懂的洞察，架起古老智慧与现代理解之间的桥梁。",
  },
];

export default function LearnPage() {
  const { locale } = useLocale();
  const isChinese = locale === "zh" || locale === "th";

  return (
    <div className="min-h-screen bg-[#12101c]">
      <header className="flex items-center justify-between px-4 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-amber-200/60 hover:text-amber-200 text-lg">←</Link>
          <span className="text-sm text-amber-200/60">{isChinese ? "了解八字" : "Learn BaZi"}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 pb-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-amber-400/30 text-xs mb-4">
            <span>☸</span><span>Ancient Eastern Wisdom</span><span>☸</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold">
            {isChinese ? "了解四柱八字" : "Understanding BaZi"}
          </h1>
          <p className="text-amber-200/40 text-sm mt-3">
            {isChinese ? "3000 年东方智慧，六分钟读懂" : "3,000 years of Eastern wisdom in 6 minutes"}
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-6 hover-glow transition-all">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0 mt-1">{s.icon}</div>
                <div>
                  <h2 className="text-lg font-bold text-amber-200 mb-2">
                    {isChinese ? s.titleZh : s.title}
                  </h2>
                  <p className="text-sm text-amber-100/50 leading-relaxed">
                    {isChinese ? s.contentZh : s.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/fortune"
            className="inline-block px-10 py-4 rounded-full font-semibold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
          >
            {isChinese ? "开始分析我的命盘 →" : "Analyze My Chart →"}
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
