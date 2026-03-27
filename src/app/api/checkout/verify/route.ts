import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

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
        .single() as { data: { status: string; tier: string } | null; error: unknown };

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("orders").upsert(
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
