import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ paid: false, error: "Missing session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      paid: session.payment_status === "paid",
      customerEmail: session.customer_details?.email || null,
    });
  } catch (error) {
    console.error("Stripe verify error:", error);
    return NextResponse.json({ paid: false, error: "Verification failed" });
  }
}
