import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
  try {
    const { chartId, userName } = await request.json();

    const origin = request.headers.get("origin") || "http://localhost:3001";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI Personality Analysis Report",
              description: "Personalized life insights based on BaZi Four Pillars framework — powered by AI",
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/fortune?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/fortune?paid=false`,
      metadata: {
        chartId: chartId || "",
        userName: userName || "",
        product: "bazi_analysis_report",
      },
      payment_intent_data: {
        metadata: {
          product: "bazi_analysis_report",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
