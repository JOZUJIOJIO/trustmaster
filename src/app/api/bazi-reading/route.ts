import { NextResponse } from "next/server";
import OpenAI from "openai";

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
  劫财: "同类争夺之力，代表魄力、冲动、兄弟",
  食神: "我所生之秀气，代表才华、福气、口福、表达",
  伤官: "我所生之锐气，代表创新、叛逆、技艺、聪明",
  正财: "我所克之稳财，代表正当收入、妻星（男命）、踏实",
  偏财: "我所克之横财，代表投资、父亲、人缘、慷慨",
  正官: "克我之正力，代表管束、上司、丈夫（女命）、名声",
  七杀: "克我之偏力，代表压力、权力、魄力、变革",
  正印: "生我之母力，代表母亲、学业、名誉、贵人",
  偏印: "生我之偏力，代表偏门学问、灵感、孤独、冷门技艺",
};

export async function POST(request: Request) {
  try {
    const { chart } = await request.json();

    if (!chart) {
      return NextResponse.json({ error: "Missing chart data" }, { status: 400 });
    }

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

    const prompt = `你是一位修行四十年的命理宗师，精研《子平真诠》《滴天髓》《穷通宝鉴》《神峰通考》。你为每一位缘主解读命盘时，既有经典学理的深度，又有对现代生活的洞察。你的风格是：沉稳、通透、温暖，像一位智者在对话，不是机器在输出。

## 此命盘的客观事实（这些是确定性计算结果，不可更改）

### 四柱八字
年柱：${chart.yearPillar.stem}${chart.yearPillar.branch}（${chart.nayin?.year || ""}）
月柱：${chart.monthPillar.stem}${chart.monthPillar.branch}（${chart.nayin?.month || ""}）
日柱：${chart.dayPillar.stem}${chart.dayPillar.branch}（${chart.nayin?.day || ""}）— 日主
时柱：${chart.hourPillar.stem}${chart.hourPillar.branch}（${chart.nayin?.hour || ""}）

### 日主分析
${dayMasterNature}
日主强弱：${chart.dayMasterStrength === "strong" ? "身强（得分" + chart.dayMasterScore + "/100）" : "身弱（得分" + chart.dayMasterScore + "/100）"}

### 十神配置
年柱十神：${chart.tenGods.year}　月柱十神：${chart.tenGods.month}　时柱十神：${chart.tenGods.hour}
命盘十神：${tenGodsContext}

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

基于以上命理事实，请输出六个维度的深度解读。核心原则：
1. **言之有据**：每一个论断都要引用具体的命盘数据（哪个柱、哪个十神、哪个五行），让人知道你的结论从何而来
2. **深入浅出**：用通俗语言解释专业概念，比如说"月柱伤官"时要解释这意味着什么
3. **具体实用**：建议要落到实处，比如具体的行业方向、具体的生活调整，而不是"注意身体"这种空话
4. **有温度**：像跟缘主面对面聊天，有关怀有洞察，不是冷冰冰的报告
5. **引经据典**：适当引用《滴天髓》《子平真诠》《穷通宝鉴》等经典，增加权威感

请严格按以下 JSON 格式返回，每个字段 250-400 字：
{
  "personality": "性格深度分析 — 从日主天性出发，结合月柱十神看社会性格，结合时柱看内心世界，结合藏干看隐藏特质。要具体到这个人在团队中的角色、思维模式、情绪特点。",
  "career": "事业与发展 — 从十神格局看职业倾向（食伤旺→创意型/官杀旺→管理型/财星旺→商业型/印星旺→学术型），结合流年大运看当前3年的事业走向，给出具体行业建议。",
  "wealth": "财运分析 — 从财星（正财/偏财）在命盘中的位置和力量分析理财风格，结合喜用神看适合的投资方向，分析当前流年的财运走势，给出具体的理财建议。",
  "love": "感情与人际 — 从日支（婚姻宫）看伴侣类型偏好，从十神看感情模式（正财/正官→专一型/偏财/伤官→浪漫自由型），分析桃花运和最佳配对方向。",
  "health": "健康指引 — 从五行偏枯看脏腑强弱（木→肝胆/火→心脏/土→脾胃/金→肺/水→肾），给出饮食、运动、作息方面的具体建议，结合季节调养指导。",
  "advice": "大师寄语 — 综合全盘，给出最核心的3条人生建议。要有高度、有智慧，像一位老师对学生的殷切叮嘱。最后用一句古语或诗词作为结尾祝福。"
}

只返回 JSON，不要其他文字。`;

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "你是精研命理四十年的宗师，风格沉稳通透有温度。严格返回JSON格式，不添加任何JSON之外的文字。",
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

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("BaZi reading error:", error);
    return NextResponse.json({ error: "服务暂时不可用，请稍后重试" }, { status: 500 });
  }
}
