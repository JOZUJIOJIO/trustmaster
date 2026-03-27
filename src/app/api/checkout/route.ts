import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment service not configured. Please contact support." },
        { status: 500 }
      );
    }

    const { chartId, chartHash, userName, userId, tier = "pro" } = await request.json();

    const origin = request.headers.get("origin") || "http://localhost:3001";

    // Pricing tiers
    const tiers: Record<string, { name: string; desc: string; amount: number }> = {
      pro: {
        name: "AI Personality Analysis — Pro",
        desc: "6-dimension AI personality reading based on BaZi Four Pillars framework",
        amount: 990, // $9.90
      },
      master: {
        name: "AI Personality Analysis — Master",
        desc: "Deep master-level reading with life cycle analysis, career planning, and personalized guidance",
        amount: 2990, // $29.90
      },
    };

    const selected = tiers[tier] || tiers.pro;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "alipay", "wechat_pay"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selected.name,
              description: selected.desc,
            },
            unit_amount: selected.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/fortune?paid=true&session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${origin}/fortune?paid=false`,
      metadata: {
        chartId: chartId || "",
        chartHash: chartHash || "",
        userName: userName || "",
        userId: userId || "",
        product: "bazi_analysis_report",
        tier,
      },
      payment_method_options: {
        wechat_pay: {
          client: "web",
        },
      },
      payment_intent_data: {
        metadata: {
          product: "bazi_analysis_report",
          tier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Stripe checkout error:", msg);
    return NextResponse.json(
      { error: "Payment processing failed. Please try again." },
      { status: 500 }
    );
  }
}
