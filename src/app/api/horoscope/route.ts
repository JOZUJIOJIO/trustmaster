import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

const langMap: Record<string, string> = {
  th: "Thai",
  en: "English",
  zh: "Chinese (Simplified)",
  vi: "Vietnamese",
  id: "Indonesian",
};

export async function POST(req: NextRequest) {
  try {
    const { sign, signName, locale } = await req.json();

    if (!sign || !signName || !locale) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const lang = langMap[locale] || "English";
    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are a warm, insightful astrologer. Generate a daily horoscope for ${signName} (${sign}) for ${today}.

Respond in ${lang} language. Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "overall": "2-3 sentence overall reading for today",
  "love": "1-2 sentence love/relationship forecast",
  "career": "1-2 sentence career/work forecast",
  "finance": "1-2 sentence financial forecast",
  "health": "1-2 sentence health/wellness forecast",
  "luckyNumber": 7,
  "luckyColor": "color name in ${lang}",
  "rating": 4
}

The rating is 1-5 stars for overall fortune. Be specific, positive but honest, and culturally sensitive for Southeast Asian audiences. Make it feel personal and spiritually meaningful.`;

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse JSON from response, handling possible markdown wrapping
    let jsonStr = content;
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```(?:json)?\n?/g, "").trim();
    }

    const data = JSON.parse(jsonStr);

    return NextResponse.json({
      sign,
      signName,
      date: today,
      ...data,
    });
  } catch (error) {
    console.error("Horoscope API error:", error);
    return NextResponse.json(
      { error: "Failed to generate horoscope" },
      { status: 500 }
    );
  }
}
