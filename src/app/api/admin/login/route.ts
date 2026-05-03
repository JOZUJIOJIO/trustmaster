import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminSessionValue, isAdminConfigured, verifyAdminPassword } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "ADMIN_ACCESS_TOKEN is not configured" }, { status: 500 });
  }
  if (!verifyAdminPassword(password || "")) {
    return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
