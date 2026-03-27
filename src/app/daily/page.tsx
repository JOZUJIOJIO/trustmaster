"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { useAuth } from "@/lib/supabase/auth-context";
import { calculateBazi, STEM_ELEMENTS, getTenGod, type BaziChart } from "@/lib/bazi";
import { ELEMENT_RECOMMENDATIONS, DAY_MASTER_DESC } from "@/lib/bazi-glossary";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

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

function getPersonalizedInsight(chart: BaziChart, scores: ReturnType<typeof calcDailyScores>, isChinese: boolean): string {
  const dm = chart.dayMaster;
  const dmEl = chart.dayMasterElement;
  const todayEl = scores.todayStemEl;
  const strength = chart.dayMasterStrength;

  // Element relationship between today and day master
  const GEN_CYCLE: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const CTRL_CYCLE: Record<string, string> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };

  const todayGeneratesDM = GEN_CYCLE[todayEl] === dmEl; // today生我
  const todayControlsDM = CTRL_CYCLE[todayEl] === dmEl; // today克我
  const dmGeneratesToday = GEN_CYCLE[dmEl] === todayEl; // 我生today
  const dmControlsToday = CTRL_CYCLE[dmEl] === todayEl; // 我克today

  if (isChinese) {
    if (todayGeneratesDM) {
      return `今日${scores.todayStem}${todayEl}生扶你的${dm}${dmEl}，如同贵人相助。${strength === "strong" ? "身强得助，能量充沛，适合主动出击、推进重要项目。" : "身弱得生，正是补充能量的好时机。多亲近长辈、师友，借力使力。"}`;
    }
    if (todayControlsDM) {
      return `今日${scores.todayStem}${todayEl}克制你的${dm}${dmEl}，压力感较强。${strength === "strong" ? "身强逢克反成磨砺，适合迎接挑战、面试竞聘、做重大决策。" : "身弱逢克需谨慎，避免硬碰硬。今天适合退一步，观察局势，养精蓄锐。"}`;
    }
    if (dmControlsToday) {
      return `今日你的${dm}${dmEl}克制${scores.todayStem}${todayEl}，财星当前。${strength === "strong" ? "身强克财，把控力强。适合谈判、签约、处理财务事项，主动争取。" : "身弱克财需量力而行，不宜大额支出或冒险投资。先稳住基本盘。"}`;
    }
    if (dmGeneratesToday) {
      return `今日你的${dm}${dmEl}生助${scores.todayStem}${todayEl}，食伤泄秀。创意和表达力旺盛，${strength === "strong" ? "身强泄秀为美，适合创作、演讲、社交、展示才华。" : "身弱逢泄需控制输出节奏，表达想法但不要过度消耗自己。"}`;
    }
    // Same element
    return `今日${scores.todayStem}${todayEl}与你的${dm}${dmEl}同气相求，比劫助身。${strength === "strong" ? "能量叠加，行动力极强。但注意不要过于刚硬，适当圆融处事。" : "同气扶持，今天自信心回升。适合团队合作、拓展人脉、争取机会。"}`;
  } else {
    if (todayGeneratesDM) {
      return `Today's ${todayEl} energy nurtures your ${dm} ${dmEl} — like receiving support from a mentor. ${strength === "strong" ? "With strong foundations boosted further, take bold action on important projects." : "Your energy gets a welcome boost. Lean on mentors and allies today."}`;
    }
    if (todayControlsDM) {
      return `Today's ${todayEl} energy challenges your ${dm} ${dmEl} — expect some pressure. ${strength === "strong" ? "Strong enough to turn pressure into growth. Good day for tough decisions." : "Tread carefully. Avoid confrontation and focus on observation."}`;
    }
    if (dmControlsToday) {
      return `Your ${dm} ${dmEl} dominates today's ${todayEl} — wealth energy is active. ${strength === "strong" ? "Strong position to negotiate, close deals, and handle finances." : "Don't overextend. Secure what you have before reaching for more."}`;
    }
    if (dmGeneratesToday) {
      return `Your ${dm} ${dmEl} feeds today's ${todayEl} — creativity flows freely. ${strength === "strong" ? "Channel your abundant energy into creative work, presentations, or social events." : "Express yourself, but pace your energy. Quality over quantity today."}`;
    }
    return `Today's ${todayEl} mirrors your ${dm} ${dmEl} — kindred energy. ${strength === "strong" ? "Double energy means double momentum. Stay flexible to avoid rigidity." : "A confidence boost today. Good for teamwork and expanding connections."}`;
  }
}

function DailyContent() {
  const { isChinese, t } = useLocale();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [isSubscriber, setIsSubscriber] = useState(false);

  // Check subscription
  useEffect(() => {
    if (!user) return;
    fetch("/api/subscription/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.subscribed) setIsSubscriber(true); })
      .catch(() => {});
  }, [user]);

  // Auto-fill from localStorage saved birth date
  useEffect(() => {
    const saved = localStorage.getItem("kairos_birth_date");
    if (saved && !birthDate) {
      setBirthDate(saved);
    }
  }, []);

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
  const dateStr = isChinese
    ? `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
    : today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Calculate scores if chart exists
  const scores = chart ? calcDailyScores(chart) : null;
  if (scores) scores.overall = Math.round((scores.career + scores.wealth + scores.love + scores.health) / 4);
  const guidance = chart && scores ? getDailyGuidance(chart, scores.tenGod) : null;
  const rec = chart ? ELEMENT_RECOMMENDATIONS[chart.luckyElement] : null;

  return (
    <div className="min-h-screen bg-[#12101c]">
      <PageHeader title={isChinese ? "每日运势" : "Daily Insights"} />

      <main className="max-w-lg lg:max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Date header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-amber-400/30 text-xs mb-3">
            <span>☸</span><span>Daily Fortune · 每日运势</span><span>☸</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-amber-100">{dateStr}</h1>
        </div>

        {!chart ? (
          /* Input state */
          <div className="text-center space-y-6">
            <div className="text-5xl mb-4 animate-float">☯</div>
            <p className="text-amber-200/50 text-sm">{isChinese ? "输入出生日期，获取专属每日运势" : "Enter your birth date for personalized daily insights"}</p>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              min="1940-01-01"
              className="w-full max-w-xs mx-auto block px-4 py-3 rounded-xl bg-white/[0.06] border border-amber-400/20 text-amber-100 text-center placeholder-amber-200/30 focus:outline-none focus:border-amber-400/40 focus:bg-white/[0.08] transition-all [color-scheme:dark]"
              style={{ colorScheme: "dark" }}
            />
            <button
              onClick={handleGenerate}
              disabled={!birthDate}
              className="w-full max-w-xs mx-auto block py-3.5 rounded-xl font-semibold cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white disabled:opacity-30 transition-all"
            >
              {isChinese ? "查看今日运势" : "View Today's Fortune"}
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
                  <div className="text-[10px] text-amber-200/30">{isChinese ? "综合运势" : "Overall"}</div>
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

            {/* Desktop 2-column grid */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">

            {/* Four dimension scores */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-1">{isChinese ? "四 维 运 势" : "FOUR DIMENSIONS"}</h3>
              <ScoreBar label={isChinese ? "事业" : "Career"} score={scores.career} icon="💼" color="#3b82f6" />
              <ScoreBar label={isChinese ? "财运" : "Wealth"} score={scores.wealth} icon="💰" color="#f59e0b" />
              <ScoreBar label={isChinese ? "感情" : "Love"} score={scores.love} icon="❤️" color="#ef4444" />
              <ScoreBar label={isChinese ? "健康" : "Health"} score={scores.health} icon="🏥" color="#22c55e" />
            </div>

            {/* Today's Auspicious / Inauspicious */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-green-500/10 rounded-2xl p-4">
                <h4 className="text-xs text-green-400/60 font-semibold mb-3 text-center">✅ {isChinese ? "今日宜" : "Do"}</h4>
                <div className="space-y-2">
                  {guidance.auspicious.map((item, i) => (
                    <div key={i} className="text-xs text-amber-100/60 flex items-center gap-1.5">
                      <span className="text-green-400/40 text-[10px]">●</span> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.03] border border-red-500/10 rounded-2xl p-4">
                <h4 className="text-xs text-red-400/60 font-semibold mb-3 text-center">❌ {isChinese ? "今日忌" : "Don't"}</h4>
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
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-4">{isChinese ? "今 日 幸 运 指 引" : "LUCKY GUIDANCE"}</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-amber-200/30 mb-1">🎨 {isChinese ? "幸运色" : "Color"}</div>
                  <div className="text-xs text-amber-100/60">{rec.colors.split("、")[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-200/30 mb-1">🧭 {isChinese ? "方位" : "Direction"}</div>
                  <div className="text-xs text-amber-100/60">{rec.directions.split("、")[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-200/30 mb-1">🔢 {isChinese ? "数字" : "Number"}</div>
                  <div className="text-xs text-amber-100/60">{rec.numbers}</div>
                </div>
              </div>
            </div>

            {/* Personalized Daily Insight */}
            <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5">
              <h3 className="text-center text-xs text-amber-400/40 tracking-widest mb-3">{isChinese ? "今 日 专 属 洞 察" : "YOUR DAILY INSIGHT"}</h3>
              <p className="text-amber-100/60 text-sm leading-relaxed text-center">
                {getPersonalizedInsight(chart, scores, isChinese)}
              </p>
            </div>

            </div>{/* End desktop 2-column grid */}

            {/* Pro Deep Insights — subscriber only */}
            {isSubscriber ? (
              <div className="bg-white/[0.03] border border-emerald-400/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">PRO</span>
                  <h3 className="text-xs text-emerald-400/60 tracking-widest">{isChinese ? "深 度 日 运 分 析" : "DEEP DAILY ANALYSIS"}</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                    <div className="text-xs font-semibold text-amber-200/70 mb-1">🎯 {isChinese ? "今日关键时段" : "Key Time Windows"}</div>
                    <p className="text-[11px] text-amber-100/50 leading-relaxed">
                      {scores.career >= 70
                        ? (isChinese ? "上午 9-11 点（巳时）事业运最旺，适合重要会议和决策。下午 3-5 点（申时）财运活跃，宜处理财务。" : "9-11am best for career decisions. 3-5pm favorable for financial matters.")
                        : (isChinese ? "上午宜静不宜动，下午 1-3 点（未时）运势回升，适合推进重要事项。晚间宜休养。" : "Morning: stay calm. 1-3pm energy rises, good for important tasks. Evening: rest.")}
                    </p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                    <div className="text-xs font-semibold text-amber-200/70 mb-1">💡 {isChinese ? "个性化行动建议" : "Personalized Actions"}</div>
                    <p className="text-[11px] text-amber-100/50 leading-relaxed">
                      {chart.dayMasterStrength === "strong"
                        ? (isChinese ? `今日${scores.tenGod}当令，身强者宜主动出击。适合谈判、签约、社交拓展。穿${rec.colors.split("、")[0]}系衣物增运。` : `Today favors proactive moves. Good for negotiations and networking. Wear ${rec.colors.split("、")[0]} for luck.`)
                        : (isChinese ? `今日${scores.tenGod}当令，身弱者宜借力使力。寻求团队支持，避免单打独斗。佩戴${chart.luckyElement}属性饰品助运。` : `Today favors teamwork over solo efforts. Seek support. Wear ${chart.luckyElement} element accessories.`)}
                    </p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                    <div className="text-xs font-semibold text-amber-200/70 mb-1">🍽️ {isChinese ? "今日饮食调养" : "Diet & Wellness"}</div>
                    <p className="text-[11px] text-amber-100/50 leading-relaxed">
                      {chart.luckyElement === "木" ? (isChinese ? "今日宜多食绿色蔬菜、酸味食物。推荐：菠菜沙拉、柠檬水、绿茶。" : "Eat green vegetables and sour foods. Try: spinach salad, lemon water, green tea.")
                       : chart.luckyElement === "火" ? (isChinese ? "今日宜食红色食物、苦味适量。推荐：番茄、红枣、苦瓜。" : "Eat red foods and moderate bitter flavors. Try: tomatoes, dates, bitter melon.")
                       : chart.luckyElement === "土" ? (isChinese ? "今日宜食甘味、黄色食物。推荐：南瓜、玉米、蜂蜜水。" : "Eat sweet and yellow foods. Try: pumpkin, corn, honey water.")
                       : chart.luckyElement === "金" ? (isChinese ? "今日宜食辛味、白色食物。推荐：白萝卜、梨、薏仁。" : "Eat pungent and white foods. Try: radish, pear, barley.")
                       : (isChinese ? "今日宜食咸味、黑色食物。推荐：海带、黑豆、黑芝麻糊。" : "Eat salty and dark foods. Try: seaweed, black beans, sesame paste.")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-emerald-400/10 rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#12101c] via-transparent to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">PRO</span>
                    <span className="text-xs text-emerald-400/60">{isChinese ? "深度日运分析" : "Deep Daily Analysis"}</span>
                  </div>
                  <p className="text-amber-200/30 text-xs mb-3">
                    {isChinese ? "关键时段 · 行动建议 · 饮食调养 · 每日更新" : "Key time windows · Action items · Diet tips · Updated daily"}
                  </p>
                  <Link
                    href="/fortune"
                    className="inline-block px-5 py-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    {isChinese ? "解锁 Pro · $4.99/月" : "Unlock Pro · $4.99/mo"}
                  </Link>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link href="/fortune" className="flex-1 py-3 rounded-xl text-sm font-medium text-center cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white transition-all">
                {isChinese ? "完整八字分析" : "Full BaZi Analysis"}
              </Link>
              <button
                onClick={() => setChart(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/5 text-amber-200/60 hover:bg-white/10 transition-colors border border-white/5"
              >
                {isChinese ? "换人查看" : "Try Another"}
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
