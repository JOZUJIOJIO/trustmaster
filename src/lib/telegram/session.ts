import crypto from "crypto";
import { cookies } from "next/headers";

export const TELEGRAM_SESSION_COOKIE = "kairos_tg_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type TelegramSessionUser = {
  telegramUserId: number;
  firstName: string;
  username?: string;
  expiresAt: number;
};

type UnsignedTelegramSession = Omit<TelegramSessionUser, "expiresAt">;

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function unbase64url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function timingSafeEqualString(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getTelegramSessionSecret() {
  return process.env.TELEGRAM_BOT_TOKEN || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_TOKEN || "";
}

export function createTelegramSessionCookieValue(
  session: UnsignedTelegramSession,
  secret = getTelegramSessionSecret(),
  expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
) {
  if (!secret) throw new Error("Telegram session secret is not configured");
  const payload = base64url(JSON.stringify({ ...session, expiresAt }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyTelegramSessionCookieValue(
  value: string | undefined,
  secret = getTelegramSessionSecret(),
  now = Math.floor(Date.now() / 1000)
): TelegramSessionUser | null {
  if (!value || !secret) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  if (!timingSafeEqualString(signature, sign(payload, secret))) return null;

  try {
    const parsed = JSON.parse(unbase64url(payload)) as TelegramSessionUser;
    if (!Number.isFinite(parsed.telegramUserId) || !parsed.firstName || !Number.isFinite(parsed.expiresAt)) return null;
    if (parsed.expiresAt <= now) return null;
    return {
      telegramUserId: parsed.telegramUserId,
      firstName: parsed.firstName,
      username: parsed.username,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function getTelegramSessionFromCookies() {
  const cookieStore = await cookies();
  return verifyTelegramSessionCookieValue(cookieStore.get(TELEGRAM_SESSION_COOKIE)?.value);
}

export function getTelegramSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
