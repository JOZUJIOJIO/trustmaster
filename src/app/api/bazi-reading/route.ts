import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getChartHash } from "@/lib/chart-hash";
import { getAuthUser } from "@/lib/supabase/auth-guard";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

// Day Master nature descriptions for prompt context
const STEM_NATURE: Record<string, string> = {
  甲: "甲木为参天大树，《滴天髓》云「甲木参天，脱胎要火」。性刚直向上，有领袖气质，喜阳光（丙火）照耀方能成材。",
  乙: "乙木为花草藤蔓，《滴天髓》云「乙木虽柔，刲羊解牛」。外柔内刚，善于借力，柔韧适应力极强。",
  丙: "丙火为太阳之火，《滴天髓》云「丙火猛烈，欺霜侮雪」。光明磊落，热情奔放，照耀万物而不求回报。",
  丁: "丁火为烛光灯火，《滴天髓》云「丁火柔中，内性昭融」。温暖内敛，洞察力强，能在黑暗中指引方向。",
  戊: "戊土为高山城墙，《滴天髓》云「戊土固重，既中且正」。厚重可靠，承载万物，是团队中的定海神针。",
  己: "己土为田园沃土，《滴天髓》云「己土卑湿，中正蓄藏」。温润养人，包容万物，善于滋养和培育。",
  庚: "庚金为刀剑矿石，《滴天髓》云「庚金带煞，刚健为最」。果决刚毅，义字当先，需经火炼方成大器。",
  辛: "辛金为珠宝美玉，《滴天髓》云「辛金软弱，温润而清」。精致高雅，内敛清贵，追求至善至美。",
  壬: "壬水为江河大海，《滴天髓》云「壬水通河，能泄金气」。智慧深沉，胸怀宽广，奔流不息志向远大。",
  癸: "癸水为雨露甘霖，《滴天髓》云「癸水至弱，达于天津」。至柔至弱却能润泽万物，直觉灵敏，感应力强。",
};

// Five Elements generation/control for context
const ELEMENT_RELATIONS: Record<string, { generates: string; controls: string; generatedBy: string; controlledBy: string }> = {
  木: { generates: "火", controls: "土", generatedBy: "水", controlledBy: "金" },
  火: { generates: "土", controls: "金", generatedBy: "木", controlledBy: "水" },
  土: { generates: "金", controls: "水", generatedBy: "火", controlledBy: "木" },
  金: { generates: "水", controls: "木", generatedBy: "土", controlledBy: "火" },
  水: { generates: "木", controls: "火", generatedBy: "金", controlledBy: "土" },
};

// Ten God meanings for context
const TEN_GOD_MEANING: Record<string, string> = {
  比肩: "同类扶持之力，代表自立、竞争、朋友",
  劫财: "同类协作之力，代表魄力、行动、伙伴与边界",
  食神: "我所生之秀气，代表才华、福气、口福、表达",
  伤官: "我所生之锐气，代表创新、叛逆、技艺、聪明",
  正财: "我所克之稳定资源，代表预算意识、责任边界、踏实",
  偏财: "我所克之机会资源，代表外部协作、人缘、慷慨",
  正官: "克我之正力，代表管束、上司、丈夫（女命）、名声",
  七杀: "克我之偏力，代表压力、权力、魄力、变革",
  正印: "生我之母力，代表母亲、学业、名誉、贵人",
  偏印: "生我之偏力，代表偏门学问、灵感、孤独、冷门技艺",
};

export async function POST(request: Request) {
  try {
    // Auth check
    const { user, telegramUser } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limit: 5 requests per minute per user
    const { allowed } = checkRateLimit(`bazi:${user.id}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { chart } = await request.json();
    if (!chart) {
      return NextResponse.json({ error: "Missing chart data" }, { status: 400 });
    }

    // === Cache lookup ===
    const chartHash = getChartHash(chart);
    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data: cached } = await supabase
        .from("readings_cache")
        .select("reading")
        .eq("chart_hash", chartHash)
        .single();

      if (cached?.reading) {
        return NextResponse.json(cached.reading);
      }
    }

    // === Server-side payment verification ===
    if (supabase) {
      const orderQuery = telegramUser
        ? supabase.from("orders").select("id").eq("telegram_user_id", telegramUser.telegramUserId).eq("status", "paid").limit(1)
        : supabase.from("orders").select("id").eq("user_id", user.id).eq("status", "paid").limit(1);
      const subscriptionQuery = telegramUser
        ? Promise.resolve({ data: [] })
        : supabase.from("subscriptions").select("id").eq("user_id", user.id).eq("status", "active").limit(1);
      const [orderResult, subResult] = await Promise.all([orderQuery, subscriptionQuery]);
      const hasPaidOrder = (orderResult.data?.length ?? 0) > 0;
      const hasActiveSub = (subResult.data?.length ?? 0) > 0;

      // Also check free readings from referrals
      const { data: profile } = telegramUser
        ? { data: null }
        : await supabase
          .from("profiles")
          .select("free_readings")
          .eq("id", user.id)
          .single();
      const hasFreeReading = (profile?.free_readings ?? 0) > 0;

      if (!hasPaidOrder && !hasActiveSub && !hasFreeReading) {
        return NextResponse.json({ error: "Payment required" }, { status: 402 });
      }

      // Deduct free reading if that's what they're using
      if (!hasPaidOrder && !hasActiveSub && hasFreeReading) {
        await supabase
          .from("profiles")
          .update({ free_readings: (profile?.free_readings ?? 1) - 1 })
          .eq("id", user.id);
      }
    }

    // === Generate AI reading ===

    // Build rich context from chart data
    const dayMasterNature = STEM_NATURE[chart.dayMaster] || "";
    const elRel = ELEMENT_RELATIONS[chart.dayMasterElement] || {};

    // Analyze ten god distribution
    const tenGodsList = [chart.tenGods.year, chart.tenGods.month, chart.tenGods.hour];
    const tenGodsContext = tenGodsList
      .map((g: string) => `${g}（${TEN_GOD_MEANING[g] || ""}）`)
      .join("、");

    // Hidden stems analysis
    const allHiddenStems = [
      ...chart.yearPillar.hiddenStems,
      ...chart.monthPillar.hiddenStems,
      ...chart.dayPillar.hiddenStems,
      ...chart.hourPillar.hiddenStems,
    ];

    // Five elements balance analysis
    const fiveEl = chart.fiveElements;
    const missingElements = Object.entries(fiveEl)
      .filter(([, v]) => (v as number) === 0)
      .map(([k]) => k);
    const strongElements = Object.entries(fiveEl)
      .filter(([, v]) => (v as number) >= 3)
      .map(([k]) => k);

    // Current year analysis
    const currentYearTenGod = chart.tenGods?.year || "";

    // Luck cycle context
    const currentAge = new Date().getFullYear() - parseInt(chart.solarDate);
    const currentLuckCycle = chart.luckCycles?.find(
      (c: { startAge: number }) => currentAge >= c.startAge && currentAge < c.startAge + 10
    );

    const prompt = `你是一位精通东方哲学、四柱五行与现代心理沟通的 AI 洞察顾问。你会把传统术语翻译成现代人可理解的自我观察、关系沟通、身心习惯和行动建议。你的风格是：沉稳、通透、温暖，像一位智者在对话，不是机器在输出。

## 此图谱的客观事实（这些是确定性计算结果，不可更改）

### 四柱图谱
年柱：${chart.yearPillar.stem}${chart.yearPillar.branch}（${chart.nayin?.year || ""}）
月柱：${chart.monthPillar.stem}${chart.monthPillar.branch}（${chart.nayin?.month || ""}）
日柱：${chart.dayPillar.stem}${chart.dayPillar.branch}（${chart.nayin?.day || ""}）— 日主
时柱：${chart.hourPillar.stem}${chart.hourPillar.branch}（${chart.nayin?.hour || ""}）

### 日主分析
${dayMasterNature}
日主强弱：${chart.dayMasterStrength === "strong" ? "身强（得分" + chart.dayMasterScore + "/100）" : "身弱（得分" + chart.dayMasterScore + "/100）"}

### 十神配置
年柱十神：${chart.tenGods.year}　月柱十神：${chart.tenGods.month}　时柱十神：${chart.tenGods.hour}
图谱十神：${tenGodsContext}

### 五行分布
木${fiveEl.木} 火${fiveEl.火} 土${fiveEl.土} 金${fiveEl.金} 水${fiveEl.水}
${missingElements.length > 0 ? `缺失：${missingElements.join("、")}` : "五行俱全"}
${strongElements.length > 0 ? `偏旺：${strongElements.join("、")}` : ""}
喜用神：${chart.luckyElement}（${elRel.generatedBy || ""}生${chart.dayMasterElement}，补其不足）
忌神：${chart.unluckyElement}

### 藏干
年支${chart.yearPillar.branch}藏：${chart.yearPillar.hiddenStems.join("、")}
月支${chart.monthPillar.branch}藏：${chart.monthPillar.hiddenStems.join("、")}
日支${chart.dayPillar.branch}藏：${chart.dayPillar.hiddenStems.join("、")}
时支${chart.hourPillar.branch}藏：${chart.hourPillar.hiddenStems.join("、")}

### 流年与大运
${chart.currentYearStem}${chart.currentYearBranch}年（${chart.currentYearNayin || ""}）
${currentLuckCycle ? `当前大运：${currentLuckCycle.stem}${currentLuckCycle.branch}（${currentLuckCycle.element}运，${currentLuckCycle.tenGod}）` : ""}

### 其他信息
性别：${chart.gender === "male" ? "男" : "女"}
生肖：${chart.zodiacAnimal}
公历：${chart.solarDate}
农历：${chart.lunarDate}

## 解读要求

基于以上图谱事实，请输出六个维度的深度解读。核心原则：
1. **言之有据**：每一个论断都要引用具体的图谱数据（哪个柱、哪个十神、哪个五行），让人知道你的结论从何而来
2. **深入浅出**：用通俗语言解释专业概念，比如说"月柱伤官"时要解释这意味着什么
3. **具体实用**：建议要落到实处，比如具体的行业方向、具体的生活调整，而不是"注意身体"这种空话
4. **有温度**：像面对面聊天，有关怀有洞察，不是冷冰冰的报告
5. **合规表达**：不要承诺命运、财富、投资收益、桃花结果或医疗结论；所有内容应是自我反思和生活参考

请严格按以下 JSON 格式返回，每个字段 250-400 字（actionItems 可简短，每条30-50字）：
{
  "personality": "性格深度分析 — 从日主天性出发，结合月柱十神看社会性格，结合时柱看内心世界，结合藏干看隐藏特质。要具体到这个人在团队中的角色、思维模式、情绪特点。",
  "career": "事业节奏 — 从十神格局看工作偏好（食伤旺→表达创意型/官杀旺→责任管理型/资源星旺→资源协调型/印星旺→学习研究型），结合流年周期看当前3年的工作节奏，给出行业和协作建议。",
  "wealth": "资源策略 — 从资源星（正财/偏财）在图谱中的位置和力量分析资源管理风格，结合喜用神看适合的长期积累方式，给出预算、合作、风险边界等生活建议，不提供投资收益承诺。",
  "love": "关系与人际 — 从日支看亲密关系偏好，从十神看沟通模式，分析关系中的安全感、边界感和协作方式，不承诺桃花或特定结果。",
  "health": "身心习惯 — 从五行偏枯看生活习惯参考（木→舒展/火→作息/土→饮食/金→呼吸/水→恢复），给出饮食、运动、睡眠方面的非医疗建议，并提醒必要时咨询专业人士。",
  "advice": "洞察寄语 — 综合全盘，给出最核心的3条人生建议。要有高度、有智慧，像一位老师对学生的殷切叮嘱。最后用一句古语或诗词作为结尾祝福。",
  "actionItems": "本月行动清单 — 基于当前流年大运和图谱格局，给出5条具体可执行的行动建议。每条格式为「领域：具体行动」。例如：「事业：本月适合主动争取项目负责人角色，尤其周三周四精力更集中」「健康：每周至少3次轻中强度运动，晚上尽量固定入睡时间」「资源：本月适合复盘预算，设定单笔支出上限」。要具体到可以立即执行的程度，不要空话。"
}

只返回 JSON，不要其他文字。`;

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "你是精通东方哲学、四柱五行与现代心理沟通的 AI 洞察顾问，风格沉稳通透有温度。严格返回JSON格式，不添加任何JSON之外的文字。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = { error: "AI 返回格式异常，请重试" };
    }

    // === Save to cache (non-blocking) ===
    if (supabase && !parsed.error) {
      supabase
        .from("readings_cache")
        .upsert(
          {
            chart_hash: chartHash,
            chart_summary: {
              dayMaster: chart.dayMaster,
              dayMasterElement: chart.dayMasterElement,
              gender: chart.gender,
              solarDate: chart.solarDate,
            },
            reading: parsed,
            tier: "pro",
          },
          { onConflict: "chart_hash" }
        )
        .then(({ error }: { error: unknown }) => {
          if (error) console.error("Failed to cache reading:", error);
        });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Four Pillars reading error:", error);
    return NextResponse.json({ error: "服务暂时不可用，请稍后重试" }, { status: 500 });
  }
}
