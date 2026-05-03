export type TelegramClientSession = {
  telegramUserId: number;
  firstName: string;
  username?: string;
  startParam?: string;
  referralCode?: string;
  isPremium?: boolean;
};

export const TELEGRAM_CLIENT_SESSION_KEY = "kairos_telegram_session";

function normalizeTelegramClientSession(value: unknown): TelegramClientSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Partial<TelegramClientSession>;
  const telegramUserId = session.telegramUserId;
  if (typeof telegramUserId !== "number" || !Number.isFinite(telegramUserId) || !session.firstName) return null;
  return {
    telegramUserId,
    firstName: session.firstName,
    username: session.username,
    startParam: session.startParam,
    referralCode: session.referralCode,
    isPremium: Boolean(session.isPremium),
  };
}

export function parseTelegramClientSession(value: string | null) {
  if (!value) return null;
  try {
    return normalizeTelegramClientSession(JSON.parse(value));
  } catch {
    return null;
  }
}

export function readTelegramClientSession() {
  if (typeof window === "undefined") return null;
  return parseTelegramClientSession(localStorage.getItem(TELEGRAM_CLIENT_SESSION_KEY));
}

export function writeTelegramClientSession(session: TelegramClientSession) {
  localStorage.setItem(TELEGRAM_CLIENT_SESSION_KEY, JSON.stringify(session));
}

export function clearTelegramClientSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TELEGRAM_CLIENT_SESSION_KEY);
}
