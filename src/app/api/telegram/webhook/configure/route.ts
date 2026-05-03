import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin session required" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const webhookUrl = new URL("/api/telegram/webhook", siteUrl).toString();
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message", "pre_checkout_query"],
      secret_token: secretToken || undefined,
    }),
  });
  const result = await telegramResponse.json();
  return NextResponse.json({ webhookUrl, result });
}
