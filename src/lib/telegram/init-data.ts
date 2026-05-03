import "server-only";

import crypto from "crypto";

export type TelegramAuthPayload = {
  query_id?: string;
  auth_date: number;
  start_param?: string;
  user?: TelegramWebAppUser;
};

export function parseTelegramInitData(initData: string): TelegramAuthPayload {
  const params = new URLSearchParams(initData);
  const userRaw = params.get("user");
  const authDate = Number(params.get("auth_date") || 0);

  return {
    query_id: params.get("query_id") || undefined,
    auth_date: authDate,
    start_param: params.get("start_param") || undefined,
    user: userRaw ? JSON.parse(userRaw) : undefined,
  };
}

export function validateTelegramInitData(initData: string, botToken: string, maxAgeSeconds = 86400) {
  if (!initData || !botToken) return { ok: false, reason: "Missing initData or bot token" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "Missing hash" };

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const calculatedBuffer = Buffer.from(calculatedHash, "hex");
  const matches = hashBuffer.length === calculatedBuffer.length && crypto.timingSafeEqual(hashBuffer, calculatedBuffer);
  if (!matches) return { ok: false, reason: "Invalid hash" };

  const authDate = Number(params.get("auth_date") || 0);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > maxAgeSeconds) return { ok: false, reason: "Expired auth_date" };

  return { ok: true, payload: parseTelegramInitData(initData) };
}
