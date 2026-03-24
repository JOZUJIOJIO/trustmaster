"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { calculateBazi, STEM_ELEMENTS, getTenGod, type BaziChart } from "@/lib/bazi";
import { ELEMENT_RECOMMENDATIONS, DAY_MASTER_DESC } from "@/lib/bazi-glossary";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// @ts-expect-error lunar-javascript has no type declarations
import { Solar } from "lunar-javascript";

// Daily fortune score based on day master vs today's stem/branch
function calcDailyScores(chart: BaziChart) {
  const today = new Date();
  const solar = Solar.fromYmd(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  const todayStem = ec.getDayGan();
  const todayBranch = ec.getDayZhi();

  const tenGod = getTenGod(chart.dayMaster, todayStem);
  const todayStemEl = STEM_ELEMENTS[todayStem];

  // Score calculation based on Ten God relationship
  const godScores: Record<string, { career: number; wealth: number; love: number; health: number }> = {
    比肩: { career: 65, wealth: 50, love: 60, health: 75 },
    劫财: { career: 55, wealth: 40, love: 55, health: 70 },
    食神: { career: 70, wealth: 65, love: 80, health: 80 },
    伤官: { career: 75, wealth: 60, love: 65, health: 60 },
    偏财: { career: 70, wealth: 85, love: 75, health: 65 },
    正财: { career: 75, wealth: 90, love: 70, health: 70 },
    七杀: { career: 80, wealth: 55, love: 50, health: 55 },
    正官: { career: 85, wealth: 70, love: 75, health: 65 },
    偏印: { career: 60, wealth: 55, love: 55, health: 70 },
    正印: { career: 65, wealth: 60, love: 70, health: 80 },
  };

  const base = godScores[tenGod] || { career: 60, wealth: 60, love: 60, health: 60 };

  // Add some deterministic daily variance based on date
  const dateHash = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) % 20 - 10;
  const luckyBonus = todayStemEl === chart.luckyElement ? 8 : 0;

  return {
    career: Math.min(99, Math.max(20, base.career + dateHash + luckyBonus)),
    wealth: Math.min(99, Math.max(20, base.wealth - dateHash + luckyBonus)),
    love: Math.min(99, Math.max(20, base.love + Math.abs(dateHash) + luckyBonus)),
    health: Math.min(99, Math.max(20, base.health - Math.abs(dateHash) + luckyBonus)),
    overall: 0,
    tenGod,
    todayStem,
    todayBranch,
    todayStemEl,
  };
}

// Today's auspicious/inauspicious activities based on day master + today
function getDailyGuidance(chart: BaziChart, tenGod: string) {
  const auspicious: Record<string, string[]> = {
    比肩: ["团队合作", "健身运动", "拜访朋友", "学习新技能"],
    劫财: ["竞标投标", "体育竞技", "社交聚会", "突破舒适区"],
    食神: ["创意写作", "美食聚餐", "演讲表达", "艺术创作"],
    伤官: ["技术研发", "革新方案", "独立思考", "打破常规"],
    偏财: ["投资理财", "商务谈判", "社交拓展", "把握机会"],
    正财: ["签约合同", "薪资谈判", "存钱理财", "务实工作"],
    七杀: ["重大决策", "领导统筹", "面试竞聘", "挑战自我"],
    正官: ["拜见上级", "递交申请", "法律事务", "遵守规则"],
    偏印: ["冥想静修", "研究学术", "阅读思考", "独处充电"],
    正印: ["拜师学习", "考试备考", "求助贵人", "修身养性"],
  };

  const inauspicious: Record<string, string[]> = {
    比肩: ["借钱给人", "独断专行", "争强好胜"],
    劫财: ["大额消费", "赌博投机", "轻信他人"],
    食神: ["节食减肥", "压抑情绪", "过度劳累"],
    伤官: ["顶撞上级", "口舌争执", "冲动消费"],
    偏财: ["稳健投资变投机", "借贷担保", "夜间外出"],
    正财: ["冒险投资", "铺张浪费", "借钱给人"],
    七杀: ["逃避责任", "优柔寡断", "过度劳累"],
    正官: ["违规操作", "迟到早退", "说谎隐瞒"],
    偏印: ["社交应酬", "做重大决定", "暴饮暴食"],
    正印: ["冒险行为", "忽略健康", "急于求成"],
  };

  return {
    auspicious: auspicious[tenGod] || ["保持平常心", "稳步前进"],
    inauspicious: inauspicious[tenGod] || ["避免冲动", "谨慎行事"],
  };
}

function ScoreBar({ label, score, icon, color }: { label: string; score: number; icon: string; color: string }) {
  const level = score >= 80 ? "极佳" : score >= 65 ? "良好" : score >= 50 ? "平稳" : "注意";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-amber-200/70 flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        <span className="text-xs text-amber-200/40">{score}/100 · {level}</span>
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function DailyContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [birthDate, setBirthDate] = useState("");

  // Check URL for pre-filled date
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setBirthDate(dateParam);
      const [y, m, d] = dateParam.split("-").map(Number);
      setChart(calculateBazi(y, m, d, "午", "male")); // default hour/gender for daily
    }
  }, [searchParams]);

  const handleGenerate = () => {
    if (!birthDate) return;
    const [y, m, d] = birthDate.split("-").map(Number);
    setChart(calculateBazi(y, m, d, "午", "male"));
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  // Calculate scores if chart exists
  const scores = chart ? calcDailyScores(chart) : null;
  if (scores) scores.overall = Math.round((scores.career + scores.wealth + scores.love + scores.health) / 4);
  const guidance = chart && scores ? getDailyGuidance(chart, scores.tenGod) : null;
  const rec = chart ? ELEMENT_RECOMMENDATIONS[chart.luckyElement] : null;

  return (
    <div className="min-h-screen bg-[#12101c]">
      <header className="flex items-center justify-between px-4 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/fortune" className="text-amber-200/60 hover:text-amber-200 text-lg">←</Link>
          <span className="text-sm text-amber-200/60">每日运势</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Date header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-amber-400/30 text-xs mb-3">
            <span>☸</span><span>Daily Fortune · 每日运势</span><span>☸</span>
          </div>
          <h1 className="text-2xl font-bold text-amber-100">{dateStr}</h1>
        </div>

        {!chart ? (
          /* Input state */
          <div className="text-center space-y-6">
            <div className="text-5xl mb-4 animate-float">☯</div>
            <p className="text-amber-200/50 text-sm">输入出生日期，获取专属每日运势</p>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className="w-full max-w-xs mx-auto bg-white/5 border border-amber-400/20 rounded-xl px-4 py-3 text-amber-100 text-center focus:outline-none focus:border-amber-400/40"
            />
            <button
              onClick={handleGenerate}
              disabled={!birthDate}
              className="w-full max-w-xs mx-auto block py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 transition-all"
            >
              查看今日运势
            </button>
          </div>
        ) : scores && guidance && rec ? (
          /* Results */
          <div className="space-y-5">
            {/* Overall score circle */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={scores.overall >= 70 ? "#22c55e" : scores.overall >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${scores.overall * 3.27} 327`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-amber-300">{scores.overall}</div>
                  <div className="text-[10px] text-amber-200/30">综合运势</div>
                </div>
              </div>
            </div>

            {/* User info tag */}
            <div className="text-center text-xs text-amber-200/40">
              <span>{chart.dayMaster}{chart.dayMasterElement}命</span>
              <span className="mx-2">·</span>
              <span>今日{scores.tenGod}当令</span>
              <span className="mx-2">·</span>
              <span>{scores.todayStem}{scores.todayBranch}日</span>
            </div>

            {/* Four dimension scores */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-1">四 维 运 势</h3>
              <ScoreBar label="事业" score={scores.career} icon="💼" color="#3b82f6" />
              <ScoreBar label="财运" score={scores.wealth} icon="💰" color="#f59e0b" />
              <ScoreBar label="感情" score={scores.love} icon="❤️" color="#ef4444" />
              <ScoreBar label="健康" score={scores.health} icon="🏥" color="#22c55e" />
            </div>

            {/* Today's Auspicious / Inauspicious */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-green-500/10 rounded-2xl p-4">
                <h4 className="text-xs text-green-400/60 font-semibold mb-3 text-center">✅ 今日宜</h4>
                <div className="space-y-2">
                  {guidance.auspicious.map((item, i) => (
                    <div key={i} className="text-xs text-amber-100/60 flex items-center gap-1.5">
                      <span className="text-green-400/40 text-[10px]">●</span> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.03] border border-red-500/10 rounded-2xl p-4">
                <h4 className="text-xs text-red-400/60 font-semibold mb-3 text-center">❌ 今日忌</h4>
                <div className="space-y-2">
                  {guidance.inauspicious.map((item, i) => (
                    <div key={i} className="text-xs text-amber-100/60 flex items-center gap-1.5">
                      <span className="text-red-400/40 text-[10px]">●</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lucky guidance */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">今 日 幸 运 指 引</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-amber-200/30 mb-1">🎨 幸运色</div>
                  <div className="text-xs text-amber-100/60">{rec.colors.split("、")[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-200/30 mb-1">🧭 方位</div>
                  <div className="text-xs text-amber-100/60">{rec.directions.split("、")[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-200/30 mb-1">🔢 数字</div>
                  <div className="text-xs text-amber-100/60">{rec.numbers}</div>
                </div>
              </div>
            </div>

            {/* Daily advice based on ten god */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-3">今 日 箴 言</h3>
              <p className="text-amber-100/60 text-sm leading-relaxed text-center">
                {scores.tenGod === "正财" || scores.tenGod === "偏财"
                  ? "财星当令，今日适合处理与钱财相关的事务。把握机遇，但勿贪心。"
                  : scores.tenGod === "正官" || scores.tenGod === "七杀"
                  ? "官杀当令，今日宜认真对待工作和责任。纪律和自律会带来回报。"
                  : scores.tenGod === "正印" || scores.tenGod === "偏印"
                  ? "印星当令，今日适合学习、思考和充电。贵人运佳，多请教长辈。"
                  : scores.tenGod === "食神" || scores.tenGod === "伤官"
                  ? "食伤当令，今日创意和表达力旺盛。适合创作、演讲、社交。"
                  : "比劫当令，今日适合团队协作和朋友交流。注意控制支出。"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link href="/fortune" className="flex-1 py-3 rounded-xl text-sm font-medium text-center cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white transition-all">
                完整八字分析
              </Link>
              <button
                onClick={() => setChart(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5"
              >
                换人查看
              </button>
            </div>
          </div>
        ) : null}
      </main>
      <BottomNav />
    </div>
  );
}

export default function DailyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12101c]" />}>
      <DailyContent />
    </Suspense>
  );
}
