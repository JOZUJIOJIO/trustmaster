"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { useTheme } from "@/lib/ThemeContext";
import { themeTokens } from "@/lib/theme-tokens";
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
    content: "Kairós combines precise traditional calculations with AI interpretation. Our engine computes your Four Pillars, Five Elements, Ten Gods, and Luck Cycles using deterministic algorithms — no randomness, 100% reproducible. Then AI synthesizes these data points into personalized, easy-to-understand insights, bridging the gap between ancient wisdom and modern comprehension.",
    contentZh: "Kairós 将精准的传统计算与 AI 解读相结合。我们的引擎使用确定性算法计算四柱、五行、十神和大运——没有随机性，100% 可复现。然后 AI 将这些数据综合成个性化的、通俗易懂的洞察，架起古老智慧与现代理解之间的桥梁。",
  },
];

export default function LearnPage() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const tk = themeTokens[theme];
  const isChinese = locale === "zh" || locale === "th";
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className={`min-h-screen ${tk.bg}`}>
      <header className={`flex items-center justify-between px-4 lg:px-12 py-4 border-b ${tk.border}`}>
        <div className="flex items-center gap-3">
          <Link href="/" className={`${tk.accent} hover:opacity-80 text-lg`}>←</Link>
          <span className={`text-sm ${tk.text2}`}>{isChinese ? "了解八字" : "Learn BaZi"}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 pb-24">
        <div className="text-center mb-12">
          <div className={`flex items-center justify-center gap-2 ${tk.accentMuted} text-xs mb-4`}>
            <span>☸</span><span>Ancient Eastern Wisdom</span><span>☸</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold">
            {isChinese ? "了解四柱八字" : "Understanding BaZi"}
          </h1>
          <p className={`${tk.text2} text-sm mt-3`}>
            {isChinese ? "3000 年东方智慧，六分钟读懂" : "3,000 years of Eastern wisdom in 6 minutes"}
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((s, i) => {
            const isOpen = expanded === i;
            const text = isChinese ? s.contentZh : s.content;
            const preview = text.slice(0, 80) + (text.length > 80 ? "…" : "");

            return (
              <div
                key={i}
                className={`${tk.card} border ${tk.accentBorder} rounded-2xl overflow-hidden hover-glow transition-all cursor-pointer`}
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <h2 className={`text-base font-bold ${tk.accent}`}>
                      {isChinese ? s.titleZh : s.title}
                    </h2>
                  </div>
                  <span className={`${tk.accentMuted} text-xs transition-transform duration-200`} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▾
                  </span>
                </div>

                {!isOpen && (
                  <div className="px-6 pb-4">
                    <p className={`text-xs ${tk.text3} leading-relaxed`}>{preview}</p>
                  </div>
                )}

                {isOpen && (
                  <div className={`px-6 pb-5 border-t ${tk.divider} pt-3`}>
                    {i === 1 && (
                      <>
                        <div className="flex justify-center my-4">
                          <svg viewBox="0 0 200 200" className="w-48 h-48">
                            {[
                              { el: "木", emoji: "🌳", color: "#22c55e", x: 100, y: 20 },
                              { el: "火", emoji: "🔥", color: "#ef4444", x: 180, y: 80 },
                              { el: "土", emoji: "⛰️", color: "#a3712a", x: 150, y: 170 },
                              { el: "金", emoji: "⚙️", color: "#f59e0b", x: 50, y: 170 },
                              { el: "水", emoji: "💧", color: "#3b82f6", x: 20, y: 80 },
                            ].map((item) => (
                              <g key={item.el}>
                                <circle cx={item.x} cy={item.y} r="22" fill={item.color} fillOpacity="0.15" stroke={item.color} strokeOpacity="0.4" strokeWidth="1.5" />
                                <text x={item.x} y={item.y - 4} textAnchor="middle" fontSize="14">{item.emoji}</text>
                                <text x={item.x} y={item.y + 12} textAnchor="middle" fill={item.color} fontSize="9" fontWeight="bold">{item.el}</text>
                              </g>
                            ))}
                            {[
                              { x1: 118, y1: 32, x2: 168, y2: 65 },
                              { x1: 185, y1: 100, x2: 162, y2: 155 },
                              { x1: 135, y1: 178, x2: 68, y2: 178 },
                              { x1: 38, y1: 155, x2: 18, y2: 100 },
                              { x1: 32, y1: 65, x2: 82, y2: 32 },
                            ].map((a, idx) => (
                              <line key={`gen-${idx}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="rgba(217,169,106,0.2)" strokeWidth="1" markerEnd="url(#arrowGold)" />
                            ))}
                            <defs>
                              <marker id="arrowGold" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="rgba(217,169,106,0.4)" />
                              </marker>
                            </defs>
                          </svg>
                        </div>
                        <p className={`text-center ${tk.accentMuted} text-[10px] mb-3`}>{isChinese ? "外圈 → 相生（滋养）" : "Outer → Generation (nurture)"}</p>
                      </>
                    )}
                    <p className={`text-sm ${tk.text2} leading-relaxed`}>{text}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 space-y-3">
          <p className={`${tk.text2} text-xs`}>
            {isChinese ? "理论已就绪，现在来看看你的命盘" : "Theory complete — now see your own chart"}
          </p>
          <Link
            href="/fortune"
            className={`inline-block px-8 py-3.5 rounded-2xl font-semibold cursor-pointer ${tk.ctaPrimary} hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all`}
          >
            {isChinese ? "生成我的命盘 →" : "Generate My Chart →"}
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
