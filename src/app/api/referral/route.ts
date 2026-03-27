import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/supabase/auth-guard";

// GET: Get referral info for a user
export async function GET() {
  const { user } = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const userId = user.id;

  const supabaseRaw = getSupabaseAdmin();
  if (!supabaseRaw) {
    return NextResponse.json({ referralCode: null, stats: null });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = supabaseRaw as any;

  // Get user's referral code and free readings
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, free_readings")
    .eq("id", userId)
    .single();

  // Get referral stats
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, status, reward_given, created_at")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });

  const signups = referrals?.length ?? 0;
  const converted = referrals?.filter((r: { status: string }) => r.status === "converted").length ?? 0;

  return NextResponse.json({
    referralCode: profile?.referral_code ?? null,
    freeReadings: profile?.free_readings ?? 0,
    stats: { signups, converted },
    referrals: referrals ?? [],
  });
}

// POST: Track a referral (called when a new user signs up with a ref code)
export async function POST(request: Request) {
  const { referralCode, newUserId } = await request.json();

  if (!referralCode || !newUserId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabaseRaw = getSupabaseAdmin();
  if (!supabaseRaw) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = supabaseRaw as any;

  // Look up referrer by code
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .single();

  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }

  // Don't self-refer
  if (referrer.id === newUserId) {
    return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
  }

  // Create referral record
  const { error: refError } = await supabase.from("referrals").upsert(
    {
      referrer_id: referrer.id,
      referred_id: newUserId,
      status: "signed_up",
    },
    { onConflict: "referrer_id,referred_id" }
  );

  if (refError) {
    console.error("Referral tracking error:", refError);
  }

  // Mark the new user's profile with referred_by
  await supabase
    .from("profiles")
    .update({ referred_by: referrer.id })
    .eq("id", newUserId);

  return NextResponse.json({ success: true, referrerId: referrer.id });
}

// PATCH: Convert a referral (called after purchase) and reward referrer
export async function PATCH() {
  const { user } = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const referredUserId = user.id;

  const supabaseRaw = getSupabaseAdmin();
  if (!supabaseRaw) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = supabaseRaw as any;

  // Find the referral
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_id, reward_given")
    .eq("referred_id", referredUserId)
    .single();

  if (!referral) {
    return NextResponse.json({ converted: false, reason: "No referral found" });
  }

  // Update referral status
  await supabase
    .from("referrals")
    .update({
      status: "converted",
      converted_at: new Date().toISOString(),
    })
    .eq("id", referral.id);

  // Reward referrer with a free reading (if not already rewarded)
  if (!referral.reward_given) {
    await supabase.rpc("increment_free_readings", { user_id: referral.referrer_id });

    await supabase
      .from("referrals")
      .update({ reward_given: true })
      .eq("id", referral.id);
  }

  return NextResponse.json({ converted: true });
}
