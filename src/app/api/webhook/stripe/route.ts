import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabaseRaw = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = supabaseRaw as any;

  // === One-time payment completed ===
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (supabase && session.mode === "payment") {
      const { error } = await supabase.from("orders").upsert(
        {
          stripe_session_id: session.id,
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          customer_email: session.customer_details?.email ?? null,
          user_id: session.metadata?.userId || null,
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

      if (error) {
        console.error("Failed to save order:", error);
        return NextResponse.json({ error: "Database write failed" }, { status: 500 });
      }
    }

    // Handle subscription checkout
    if (supabase && session.mode === "subscription" && session.subscription) {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const firstItem = sub.items.data[0];
      const periodStart = firstItem?.current_period_start;
      const periodEnd = firstItem?.current_period_end;

      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: session.metadata?.userId || null,
          stripe_customer_id:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? "",
          stripe_subscription_id: sub.id,
          plan: session.metadata?.plan ?? "monthly",
          status: sub.status,
          current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_subscription_id" }
      );

      if (error) {
        console.error("Failed to save subscription:", error);
        return NextResponse.json({ error: "Database write failed" }, { status: 500 });
      }
    }
  }

  // === Subscription updated (renewal, plan change, cancellation) ===
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const item = sub.items.data[0];
    const pStart = item?.current_period_start;
    const pEnd = item?.current_period_end;

    if (supabase) {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: sub.status,
          current_period_start: pStart ? new Date(pStart * 1000).toISOString() : null,
          current_period_end: pEnd ? new Date(pEnd * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);

      if (error) {
        console.error("Failed to update subscription:", error);
        return NextResponse.json({ error: "Database write failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
