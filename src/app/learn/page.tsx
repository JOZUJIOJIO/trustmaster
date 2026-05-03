"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { useTheme } from "@/lib/ThemeContext";
import { themeTokens } from "@/lib/theme-tokens";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { PageArtworkBand } from "@/components/PageArtwork";

const sections = [
  {
    icon: "☯",
    title: "What is the Four Pillars Map?",
    titleZh: "什么是四柱图谱？",
    content: "The Four Pillars Map is a 3,000-year-old Chinese philosophical framework that maps personal temperament and life rhythms using the exact moment of birth. Each map consists of four pillars — Year, Month, Day, and Hour — each containing a Heavenly Stem and an Earthly Branch.",
    contentZh: "四柱是一套拥有 3000 年历史的中国哲学分析体系。它通过出生时刻的年、月、日、时四柱——每柱包含一个天干和一个地支——来绘制你的能量图谱。",
  },
  {
    icon: "🌳",
    title: "The Five Elements",
    titleZh: "五行是什么？",
    content: "Everything in the Four Pillars system is built on Five Elements: Wood (木), Fire (火), Earth (土), Metal (金), and Water (水). These elements interact through two cycles: the Generation Cycle (Wood → Fire → Earth → Metal → Water → Wood) where each element nourishes the next, and the Control Cycle where each element restrains another. Your map's balance of these elements reveals strengths, challenges, and behavior patterns.",
    contentZh: "四柱系统建立在五行基础上：木、火、土、金、水。五行通过相生（木→火→土→金→水→木）和相克两个循环互相作用。你图谱中五行的平衡揭示了优势、挑战和行为模式。",
  },
  {
    icon: "🎯",
    title: "The Day Master",
    titleZh: "什么是日主？",
    content: "The Day Master (日主) is the Heavenly Stem of your Day Pillar — it represents your core reference point. All other elements in your map are analyzed in relation to your Day Master. For example, if your Day Master is Wood (甲 or 乙), Fire represents expression, Earth represents resources, Metal represents rules and structure, and Water represents learning and support.",
    contentZh: "日主是日柱的天干——代表「你自己」。图谱中所有其他元素都以日主为参照进行分析。比如日主为木的人，火代表表达，土代表资源，金代表规则，水代表学习和支持。",
  },
  {
    icon: "✦",
    title: "Ten Gods (十神)",
    titleZh: "什么是十神？",
    content: "The Ten Symbols describe the relationship between your Day Master and every other element in your map. We present them as modern themes such as self, collaboration, expression, creation, resources, rules, challenge, learning, and insight. Each symbol reveals a different aspect of work style, relationships, resources, creativity, and more.",
    contentZh: "十神描述日主与图谱中其他元素的关系。Kairós 会将传统术语翻译成现代主题：自我、协作、表达、创造、稳定资源、机会资源、规则、挑战、学习与洞察，让它更容易被今天的人理解。",
  },
  {
    icon: "📅",
    title: "Luck Cycles (大运)",
    titleZh: "什么是大运？",
    content: "Your life unfolds in 10-year Luck Cycles (大运). Each cycle brings a different elemental energy that interacts with your natal chart, creating periods of opportunity or challenge. Understanding your current luck cycle helps you make better decisions — when to push forward, when to consolidate, and when to prepare for change.",
    contentZh: "人生按每十年一个「大运」周期展开。每个大运带来不同的五行能量，与你的先天图谱交互，形成不同节奏。了解当前周期帮助你做出更好的决策——何时进取、何时守成、何时准备变化。",
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
          <span className={`text-sm ${tk.text2}`}>{isChinese ? "了解图谱" : "Learn the Map"}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <PageArtworkBand art="learn" className="px-4 py-12 lg:py-16 text-center border-b border-amber-400/10">
        <div className="max-w-2xl mx-auto">
          <div className={`flex items-center justify-center gap-2 ${tk.accentMuted} text-xs mb-4`}>
            <span>☸</span><span>Ancient Eastern Wisdom</span><span>☸</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold">
            {isChinese ? "了解四柱图谱" : "Understanding the Four Pillars Map"}
          </h1>
          <p className={`${tk.text2} text-sm mt-3`}>
            {isChinese ? "3000 年东方智慧，六分钟读懂" : "3,000 years of Eastern wisdom in 6 minutes"}
          </p>
        </div>
      </PageArtworkBand>

      <main className="max-w-2xl mx-auto px-4 py-10 pb-24">

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
            {isChinese ? "理论已就绪，现在来看看你的图谱" : "Theory complete — now see your own map"}
          </p>
          <Link
            href="/fortune"
            className={`inline-block px-8 py-3.5 rounded-2xl font-semibold cursor-pointer ${tk.ctaPrimary} hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all`}
          >
            {isChinese ? "生成我的图谱 →" : "Generate My Map →"}
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
