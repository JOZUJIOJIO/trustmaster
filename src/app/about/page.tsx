"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/lib/ThemeContext";
import { themeTokens } from "@/lib/theme-tokens";

export default function AboutPage() {
  const { isChinese } = useLocale();
  const { theme } = useTheme();
  const tk = themeTokens[theme];

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme === "cosmic"
          ? "#12101c"
          : "linear-gradient(180deg, #E8E6F0 0%, #F2F0EB 40%, #F8F5EE 100%)",
      }}
    >
      <PageHeader title={isChinese ? "关于" : "About"} href="/" />

      <main className="max-w-2xl lg:max-w-5xl mx-auto px-4 lg:px-8 py-10 lg:py-16 pb-24">
        {/* Brand Hero — full width, cinematic */}
        <section className="text-center mb-16 lg:mb-20">
          <div className="text-5xl mb-5">🔮</div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold text-gradient-gold mb-6">Kairós</h1>
          <p className={`font-display text-lg lg:text-xl ${tk.text2} italic max-w-xl mx-auto leading-relaxed`}>
            {isChinese
              ? "「Kairós — 命运转折的那一刻」"
              : '"Kairós — The Moment That Changes Everything"'}
          </p>
        </section>

        {/* Brand Story — wide prose */}
        <section className="mb-16 lg:mb-20">
          <div className={`${tk.card} border ${tk.accentBorder} rounded-2xl p-6 lg:p-10`}>
            <h2 className={`font-display text-xl lg:text-2xl font-bold ${tk.accent} mb-6`}>
              {isChinese ? "名字的由来" : "The Name"}
            </h2>
            <div className={`space-y-4 text-sm lg:text-base ${tk.text2} leading-relaxed`}>
              <p>
                {isChinese
                  ? "在古希腊，有两种关于时间的概念。Chronos（χρόνος）是线性流逝的时间——分秒、日月、年岁。而 Kairós（καιρός）是完全不同的东西：它是那个「恰到好处的时刻」，命运的缝隙，万事万物交汇的瞬间。"
                  : "In ancient Greece, there were two words for time. Chronos (χρόνος) is sequential time — seconds, months, years flowing past. But Kairós (καιρός) is something entirely different: it is the supreme moment, the crack in fate where everything converges."}
              </p>
              <p>
                {isChinese
                  ? "中国命理学的核心思想与此惊人地一致：你出生的那一刻——年、月、日、时——四柱八字精确地定义了你与宇宙的关系。那不是随机的一秒钟，那是你的 Kairós。"
                  : "The core insight of Chinese metaphysics aligns with this remarkably: the exact moment of your birth — year, month, day, hour — your Four Pillars precisely define your relationship with the universe. That wasn't a random second. That was your Kairós."}
              </p>
              <p>
                {isChinese
                  ? "我们相信，理解你的 Kairós，就是理解你自己。这就是为什么我们将三千年东方智慧与现代 AI 融合——不是为了预言未来，而是为了帮你看清：你是谁，你的能量在哪里，以及什么时候是你的最佳时刻。"
                  : "We believe that understanding your Kairós is understanding yourself. That's why we fuse 3,000 years of Eastern wisdom with modern AI — not to predict the future, but to help you see clearly: who you are, where your energy flows, and when your moment arrives."}
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy + Method — 2 column on desktop */}
        <section className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0 mb-16 lg:mb-20">
          {/* Philosophy */}
          <div className={`${tk.card} border ${tk.accentBorder} rounded-2xl p-6 lg:p-8`}>
            <h2 className={`font-display text-lg lg:text-xl font-bold ${tk.accent} mb-4`}>
              {isChinese ? "我们的哲学" : "Our Philosophy"}
            </h2>
            <div className="space-y-3">
              {[
                {
                  zh: "克制的智慧，而非喧嚣的预言",
                  en: "Quiet wisdom, not loud prophecy",
                  descZh: "我们不告诉你「明天会发生什么」。我们帮你理解自己的能量场，让你在每一个决策中更清醒。",
                  descEn: "We don't tell you what will happen tomorrow. We help you understand your energy, so you can make every decision with clarity.",
                },
                {
                  zh: "确定性计算，零随机",
                  en: "Deterministic calculation, zero randomness",
                  descZh: "同一个出生时刻，永远生成同一张命盘。没有掷骰子，没有猜测。每一个结论都有据可查。",
                  descEn: "The same birth moment always produces the same chart. No dice, no guessing. Every conclusion is traceable.",
                },
                {
                  zh: "东方智慧 × 现代理解",
                  en: "Eastern wisdom × modern understanding",
                  descZh: "经典命理的深度，配合 AI 的通俗解读。让三千年的洞察力变成你今天就能用的行动指南。",
                  descEn: "The depth of classical metaphysics, with AI making it accessible. Turning 3,000-year-old insight into today's action guide.",
                },
              ].map((item) => (
                <div key={item.en} className={`${tk.sectionBg} rounded-xl p-4 border ${tk.divider}`}>
                  <div className={`text-sm font-semibold ${tk.accent} mb-1`}>{isChinese ? item.zh : item.en}</div>
                  <p className={`text-xs ${tk.label} leading-relaxed`}>{isChinese ? item.descZh : item.descEn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology */}
          <div className={`${tk.card} border ${tk.accentBorder} rounded-2xl p-6 lg:p-8`}>
            <h2 className={`font-display text-lg lg:text-xl font-bold ${tk.accent} mb-4`}>
              {isChinese ? "方法论基础" : "Built On Classics"}
            </h2>
            <div className="space-y-3">
              {[
                { name: isChinese ? "《子平真诠》" : "Zi Ping Zhen Quan", desc: isChinese ? "四柱命理的经典理论基础" : "The foundational classic of Four Pillars theory" },
                { name: isChinese ? "《滴天髓》" : "Di Tian Sui", desc: isChinese ? "八字分析的核心推理框架" : "Core reasoning framework for BaZi analysis" },
                { name: isChinese ? "《穷通宝鉴》" : "Qiong Tong Bao Jian", desc: isChinese ? "五行调候的权威参考" : "Authoritative reference for Five Elements" },
                { name: isChinese ? "《神峰通考》" : "Shen Feng Tong Kao", desc: isChinese ? "命理实战的集大成之作" : "Comprehensive practical metaphysics guide" },
              ].map((item) => (
                <div key={item.name} className={`flex items-start gap-3 ${tk.sectionBg} rounded-xl p-4 border ${tk.divider}`}>
                  <span className={`${tk.accentMuted} text-sm mt-0.5`}>📖</span>
                  <div>
                    <div className={`text-sm font-semibold ${tk.accent}`}>{item.name}</div>
                    <div className={`text-xs ${tk.label}`}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tech stack */}
            <div className={`mt-6 pt-6 border-t ${tk.divider}`}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "⚙️", label: isChinese ? "确定性引擎" : "Precise Engine" },
                  { icon: "🤖", label: isChinese ? "AI 深度解读" : "AI Interpretation" },
                  { icon: "🔒", label: isChinese ? "隐私保护" : "Privacy First" },
                  { icon: "🌐", label: isChinese ? "五语言支持" : "5 Languages" },
                ].map((item) => (
                  <div key={item.label} className="text-center py-2">
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className={`text-xs ${tk.text2}`}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story */}
        <section className="mb-16 lg:mb-20">
          <div className={`${tk.card} border ${tk.accentBorder} rounded-2xl p-6 lg:p-10`}>
            <h2 className={`font-display text-xl lg:text-2xl font-bold ${tk.accent} mb-6`}>
              {isChinese ? "创造者的话" : "From the Creator"}
            </h2>
            <div className={`space-y-4 text-sm lg:text-base ${tk.text2} leading-relaxed`}>
              <p>
                {isChinese
                  ? "我在硅谷做了多年技术工作，对数据和逻辑有天然的信仰。命理？那不过是玄学罢了——至少我曾经这样认为。"
                  : "I spent years in tech, with a natural faith in data and logic. Metaphysics? Just superstition — or so I thought."}
              </p>
              <p>
                {isChinese
                  ? "2024年一次偶然的机会，一位老师帮我排了八字。他没有问我任何问题，却精准地描述了我过去十年的每一次重大转折——换行业、跨国搬迁、那次差点放弃一切的低谷。那一刻，我的世界观被动摇了。"
                  : "In 2024, a master read my BaZi chart without asking a single question — yet precisely described every major turning point in my past decade: the career change, the cross-country move, that low point where I almost gave up everything. My worldview shifted."}
              </p>
              <p>
                {isChinese
                  ? "我不相信「算命」，但我开始相信这套三千年的分析框架蕴含着深刻的智慧。问题是：它被锁在古文和少数人的圈子里。于是我决定用技术打开它——让每个人都能理解自己的「Kairós」。"
                  : "I don't believe in fortune-telling. But I started believing that this 3,000-year-old analytical framework holds profound wisdom. The problem: it was locked behind classical texts and closed circles. So I decided to use technology to unlock it — to help everyone find their 'Kairós'."}
              </p>
              <p className={`${tk.text3} italic`}>
                {isChinese
                  ? "—— Kairós 创始人，一个被八字说服的工程师"
                  : "— The Kairós founder, an engineer convinced by BaZi"}
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer — full width */}
        <section className="mb-10">
          <div className={`${tk.sectionBg} border ${tk.accentBorder} rounded-2xl p-6 lg:p-8`}>
            <h2 className={`font-display text-lg font-bold ${tk.label} mb-3`}>
              {isChinese ? "重要声明" : "Disclaimer"}
            </h2>
            <p className={`text-sm ${tk.label} leading-relaxed`}>
              {isChinese
                ? "Kairós 提供的所有分析和洞察均由 AI 生成，仅供自我探索、个人成长和娱乐参考。我们不提供医疗、法律或财务建议。重大人生决策请咨询专业人士。"
                : "All analysis provided by Kairós is AI-generated for self-exploration, personal growth, and entertainment. We do not provide medical, legal, or financial advice. Consult professionals for major life decisions."}
            </p>
          </div>
        </section>

        {/* Contact — minimal */}
        <section className="text-center">
          <p className={`text-sm ${tk.text3} mb-3`}>hello@kairos.app</p>
          <div className="flex justify-center gap-6">
            <Link href="/terms" className={`text-xs ${tk.text3} hover:opacity-70 transition-colors underline underline-offset-2`}>
              {isChinese ? "服务条款" : "Terms"}
            </Link>
            <Link href="/privacy" className={`text-xs ${tk.text3} hover:opacity-70 transition-colors underline underline-offset-2`}>
              {isChinese ? "隐私政策" : "Privacy"}
            </Link>
          </div>
          <p className={`text-xs ${tk.footerText} mt-6`}>© 2026 Kairós</p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
