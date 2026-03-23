import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export async function POST(request: Request) {
  try {
    const { chart } = await request.json();

    if (!chart) {
      return NextResponse.json({ error: "Missing chart data" }, { status: 400 });
    }

    const prompt = `你是一位精通中国传统命理学的八字大师，拥有 30 年实战经验。请基于以下精准的八字命盘数据，给出专业且通俗易懂的解读。

## 命盘数据
- 公历：${chart.solarDate}
- 农历：${chart.lunarDate}
- 性别：${chart.gender === "male" ? "男" : "女"}
- 四柱八字：${chart.yearPillar.stem}${chart.yearPillar.branch} ${chart.monthPillar.stem}${chart.monthPillar.branch} ${chart.dayPillar.stem}${chart.dayPillar.branch} ${chart.hourPillar.stem}${chart.hourPillar.branch}
- 日主：${chart.dayMaster}（${chart.dayMasterElement}）
- 五行分布：木${chart.fiveElements.木} 火${chart.fiveElements.火} 土${chart.fiveElements.土} 金${chart.fiveElements.金} 水${chart.fiveElements.水}
- 喜用神：${chart.luckyElement}
- 生肖：${chart.zodiacAnimal}
- 星座：${chart.westernZodiac}

## 要求
请严格按照以下 JSON 格式返回，每个字段 80-150 字：
{
  "personality": "基于日主和八字组合的性格分析",
  "career": "基于八字的事业运势分析，包含当前流年影响",
  "wealth": "财运分析，基于财星强弱",
  "love": "感情运势，基于桃花星和婚姻宫",
  "health": "健康提醒，基于五行偏旺偏弱",
  "advice": "开运建议，基于喜用神给出具体的颜色、方位、行业建议"
}

注意：
1. 必须基于真实的八字理论进行分析，不能随意编造
2. 使用专业术语但要解释清楚
3. 建议要具体可行，不要空泛
4. 只返回 JSON，不要其他文字`;

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
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
