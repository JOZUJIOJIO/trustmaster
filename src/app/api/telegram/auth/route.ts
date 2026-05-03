import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validateTelegramInitData } from "@/lib/telegram/init-data";

export const dynamic = "force-dynamic";

function referralFromStartParam(startParam?: string) {
  if (!startParam) return null;
  return startParam.startsWith("ref_") ? startParam.replace(/^ref_/, "") : null;
}

export async function POST(request: Request) {
  const { initData, startParam } = await request.json().catch(() => ({ initData: "", startParam: "" }));
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }

  const validation = validateTelegramInitData(initData, botToken);
  if (!validation.ok || !validation.payload?.user) {
    return NextResponse.json({ error: validation.reason || "Invalid Telegram initData" }, { status: 401 });
  }

  const user = validation.payload.user;
  const resolvedStartParam = validation.payload.start_param || startParam || "";
  const referralCode = referralFromStartParam(resolvedStartParam);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    await supabase.from("telegram_accounts").upsert({
      telegram_user_id: user.id,
      username: user.username || null,
      first_name: user.first_name,
      last_name: user.last_name || null,
      language_code: user.language_code || null,
      is_premium: Boolean(user.is_premium),
      photo_url: user.photo_url || null,
      start_param: resolvedStartParam || null,
      referral_code: referralCode,
      last_seen_at: new Date().toISOString(),
      raw_user: JSON.parse(JSON.stringify(user)),
    }, { onConflict: "telegram_user_id" });
  }

  return NextResponse.json({
    telegramUserId: user.id,
    firstName: user.first_name,
    username: user.username,
    startParam: resolvedStartParam || undefined,
    referralCode: referralCode || undefined,
    isPremium: Boolean(user.is_premium),
  });
}
