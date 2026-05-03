import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kairos_admin_session";

function adminToken() {
  return process.env.ADMIN_ACCESS_TOKEN || "";
}

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_TOKEN || "";
}

export function isAdminConfigured() {
  return adminToken().length >= 8;
}

export function createAdminSessionValue() {
  return crypto
    .createHmac("sha256", adminSecret())
    .update(adminToken())
    .digest("hex");
}

export function verifyAdminPassword(password: string) {
  const token = adminToken();
  if (!token || !password) return false;
  const left = Buffer.from(password);
  const right = Buffer.from(token);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyAdminSessionValue(value?: string) {
  if (!isAdminConfigured() || !value) return false;
  const expected = createAdminSessionValue();
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionValue(cookieStore.get(ADMIN_COOKIE)?.value);
}
