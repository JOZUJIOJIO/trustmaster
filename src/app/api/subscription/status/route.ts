import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/supabase/auth-guard";

export async function POST() {
  try {
    const { user } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ subscribed: false });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ subscribed: false });
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
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
