import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, stored: false });

  const telegramUserId = Number(body.telegramUserId || 0) || null;
  const eventName = typeof body.eventName === "string" ? body.eventName : "unknown";
  const path = typeof body.path === "string" ? body.path : null;
  const startParam = typeof body.startParam === "string" ? body.startParam : null;

  const { error } = await supabase.from("telegram_events").insert({
    telegram_user_id: telegramUserId,
    event_name: eventName,
    path,
    start_param: startParam,
    metadata: body.metadata || {},
  });

  return NextResponse.json({ ok: !error, stored: !error, error: error?.message });
}
