import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.delete({ name: ADMIN_COOKIE, path: "/" });
  return response;
}
