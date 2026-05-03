import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { referralCode, path = "/fortune" } = await request.json().catch(() => ({}));
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  if (!botUsername) {
    const url = new URL(path, baseUrl);
    if (referralCode) url.searchParams.set("ref", referralCode);
    return NextResponse.json({ url: url.toString(), mode: "web" });
  }

  const startapp = referralCode ? `ref_${referralCode}` : "kairos";
  return NextResponse.json({
    url: `https://t.me/${botUsername}?startapp=${encodeURIComponent(startapp)}`,
    mode: "telegram",
  });
}
