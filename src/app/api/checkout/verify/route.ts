import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ paid: false, error: "Missing session ID" });
    }

    // First check DB (webhook may have already recorded it)
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: existing } = await supabase
        .from("orders")
        .select("status, tier")
        .eq("stripe_session_id", sessionId)
        .single();

      if (existing?.status === "paid") {
        return NextResponse.json({
          paid: true,
          tier: existing.tier,
        });
      }
    }

    // Fallback: verify directly with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    // If paid but not in DB yet (webhook race condition), write it now
    if (paid && supabase) {
      await supabase.from("orders").upsert(
        {
          stripe_session_id: session.id,
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          customer_email: session.customer_details?.email ?? null,
          chart_id: session.metadata?.chartId ?? "",
          user_name: session.metadata?.userName ?? "",
          tier: session.metadata?.tier ?? "pro",
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: "paid",
          paid_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );
    }

    return NextResponse.json({
      paid,
      tier: session.metadata?.tier ?? "pro",
      customerEmail: session.customer_details?.email ?? null,
    });
  } catch (error) {
    console.error("Stripe verify error:", error);
    return NextResponse.json({ paid: false, error: "Verification failed" });
  }
}
