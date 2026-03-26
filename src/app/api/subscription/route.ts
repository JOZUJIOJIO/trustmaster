import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment service not configured." },
        { status: 500 }
      );
    }

    const { userId, email, plan = "monthly" } = await request.json();

    const origin = request.headers.get("origin") || "http://localhost:3001";

    const plans: Record<string, { name: string; amount: number; interval: "month" | "year" }> = {
      monthly: {
        name: "Kairós Pro — Monthly",
        amount: 499, // $4.99/month
        interval: "month",
      },
      yearly: {
        name: "Kairós Pro — Yearly",
        amount: 3990, // $39.90/year (save 33%)
        interval: "year",
      },
    };

    const selected = plans[plan] || plans.monthly;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "alipay"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selected.name,
              description: "Unlimited AI readings, daily insights, priority support",
            },
            unit_amount: selected.amount,
            recurring: {
              interval: selected.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/profile?subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/fortune?subscribed=false`,
      customer_email: email || undefined,
      metadata: {
        userId: userId || "",
        plan,
        product: "kairos_pro_subscription",
      },
      subscription_data: {
        metadata: {
          userId: userId || "",
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Subscription checkout error:", msg);
    return NextResponse.json(
      { error: `Payment error: ${msg}` },
      { status: 500 }
    );
  }
}
