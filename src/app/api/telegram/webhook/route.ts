import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { answerPreCheckoutQuery } from "@/lib/telegram/stars";

export const dynamic = "force-dynamic";

type TelegramPreCheckoutQuery = {
  id: string;
  currency: string;
  total_amount: number;
  invoice_payload: string;
  from?: { id: number; first_name?: string; username?: string };
};

type TelegramSuccessfulPayment = {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  telegram_payment_charge_id: string;
};

type TelegramUpdate = {
  pre_checkout_query?: TelegramPreCheckoutQuery;
  message?: {
    from?: { id: number; first_name?: string; username?: string };
    successful_payment?: TelegramSuccessfulPayment;
  };
};

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Invalid Telegram webhook secret" }, { status: 401 });
  }

  const update = (await request.json().catch(() => ({}))) as TelegramUpdate;

  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;
    const ok = query.currency === "XTR" && query.invoice_payload.startsWith("stars_") && query.total_amount > 0;
    await answerPreCheckoutQuery({
      botToken,
      preCheckoutQueryId: query.id,
      ok,
      errorMessage: ok ? undefined : "Invalid Stars invoice.",
    });
    return NextResponse.json({ ok: true, preCheckoutAnswered: ok });
  }

  const payment = update.message?.successful_payment;
  if (payment) {
    const telegramUserId = update.message?.from?.id ?? null;
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const syntheticSessionId = `tg_paid_${payment.telegram_payment_charge_id}`;
      const { data: pending } = await supabase
        .from("orders")
        .select("chart_id, user_name, tier")
        .eq("stripe_session_id", `tg_pending_${payment.invoice_payload}`)
        .single();

      await supabase.from("orders").upsert(
        {
          stripe_session_id: syntheticSessionId,
          stripe_payment_intent: payment.telegram_payment_charge_id,
          customer_email: null,
          user_id: null,
          telegram_user_id: telegramUserId,
          payment_provider: "telegram_stars",
          telegram_payment_charge_id: payment.telegram_payment_charge_id,
          chart_id: pending?.chart_id ?? "",
          user_name: pending?.user_name ?? update.message?.from?.first_name ?? "",
          tier: pending?.tier ?? "pro",
          amount: payment.total_amount,
          currency: payment.currency,
          status: "paid",
          paid_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );

      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent: payment.telegram_payment_charge_id,
          telegram_payment_charge_id: payment.telegram_payment_charge_id,
          paid_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", `tg_pending_${payment.invoice_payload}`);
    }
    return NextResponse.json({ ok: true, paymentStored: true });
  }

  return NextResponse.json({ ok: true });
}
