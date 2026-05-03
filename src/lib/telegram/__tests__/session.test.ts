import { describe, expect, it } from "vitest";
import {
  createTelegramSessionCookieValue,
  verifyTelegramSessionCookieValue,
} from "@/lib/telegram/session";

describe("Telegram session cookie", () => {
  it("round-trips a signed Telegram user session", () => {
    const cookie = createTelegramSessionCookieValue(
      { telegramUserId: 123456, firstName: "Kai", username: "kairos" },
      "test-secret",
      1_800_000_000
    );

    expect(verifyTelegramSessionCookieValue(cookie, "test-secret", 1_700_000_000)).toEqual({
      telegramUserId: 123456,
      firstName: "Kai",
      username: "kairos",
      expiresAt: 1_800_000_000,
    });
  });

  it("rejects tampered session values", () => {
    const cookie = createTelegramSessionCookieValue(
      { telegramUserId: 123456, firstName: "Kai" },
      "test-secret",
      1_800_000_000
    );

    const [payload, signature] = cookie.split(".");
    const tampered = `${payload.slice(0, -1)}x.${signature}`;

    expect(verifyTelegramSessionCookieValue(tampered, "test-secret", 1_700_000_000)).toBeNull();
  });
});
