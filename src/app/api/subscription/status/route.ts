import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ subscribed: false });
    }

    const supabaseRaw = getSupabaseAdmin();
    if (!supabaseRaw) {
      return NextResponse.json({ subscribed: false });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = supabaseRaw as any;

    const { data } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      return NextResponse.json({
        subscribed: true,
        plan: data.plan,
        expiresAt: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
      });
    }

    return NextResponse.json({ subscribed: false });
  } catch {
    return NextResponse.json({ subscribed: false });
  }
}
