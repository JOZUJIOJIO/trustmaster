import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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
    // Rate limit: 10 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`horoscope:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { sign, signName, locale } = await req.json();

    if (!sign || !signName || !locale) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const lang = langMap[locale] || "English";
    const today = new Date().toISOString().split("T")[0];

    // === Cache lookup ===
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: cached } = await supabase
        .from("horoscope_cache")
        .select("data")
        .eq("sign", sign)
        .eq("locale", locale)
        .eq("date", today)
        .single() as any;

      if (cached?.data) {
        return NextResponse.json(cached.data);
      }
    }

    // === AI generation ===
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

    const result = { sign, signName, date: today, ...data };

    // === Save to cache (non-blocking) ===
    if (supabase) {
      (supabase as any)
        .from("horoscope_cache")
        .upsert(
          { sign, locale, date: today, data: result },
          { onConflict: "sign,locale,date" }
        )
        .then(({ error }: any) => {
          if (error) console.error("Failed to cache horoscope:", error);
        });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Horoscope API error:", error);
    return NextResponse.json(
      { error: "Failed to generate horoscope" },
      { status: 500 }
    );
  }
}
