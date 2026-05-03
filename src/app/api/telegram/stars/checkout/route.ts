import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { validateTelegramInitData } from "@/lib/telegram/init-data";
import {
  buildTelegramStarsInvoicePayload,
  createTelegramStarsInvoiceLink,
  createTelegramStarsPayload,
  getTelegramStarsProduct,
  productIdFromTier,
  setTelegramStarsWebhook,
} from "@/lib/telegram/stars";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }

  const validation = validateTelegramInitData(String(body.initData || ""), botToken);
  if (!validation.ok || !validation.payload?.user) {
    return NextResponse.json({ error: validation.reason || "Invalid Telegram initData" }, { status: 401 });
  }

  const telegramUser = validation.payload.user;
  const product = getTelegramStarsProduct(productIdFromTier(String(body.tier || "pro")));
  const payload = createTelegramStarsPayload();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || new URL(request.url).origin;
  const webhookUrl = new URL("/api/telegram/webhook", origin).toString();
  const webhookResult = await setTelegramStarsWebhook({
    botToken,
    webhookUrl,
    secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
  });

  if (!webhookResult.ok) {
    return NextResponse.json(
      { error: webhookResult.description || "Failed to configure Telegram Stars webhook" },
      { status: 502 }
    );
  }

  const invoice = buildTelegramStarsInvoicePayload({
    product,
    payload,
    userName: typeof body.userName === "string" ? body.userName : undefined,
  });

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("orders").upsert(
      {
        stripe_session_id: `tg_pending_${payload}`,
        stripe_payment_intent: null,
        customer_email: null,
        user_id: null,
        telegram_user_id: telegramUser.id,
        payment_provider: "telegram_stars",
        telegram_payment_charge_id: null,
        chart_id: typeof body.chartId === "string" ? body.chartId : "",
        user_name: typeof body.userName === "string" ? body.userName : telegramUser.first_name,
        tier: product.tier,
        amount: product.amount,
        currency: "XTR",
        status: "pending",
      },
      { onConflict: "stripe_session_id" }
    );
  }

  const result = await createTelegramStarsInvoiceLink(botToken, invoice);
  if (!result.ok) {
    return NextResponse.json({ error: result.description || "Failed to create Telegram Stars invoice" }, { status: 502 });
  }

  return NextResponse.json({
    invoiceLink: result.result,
    payload,
    amount: product.amount,
    currency: "XTR",
    tier: product.tier,
    provider: "telegram_stars",
  });
}
