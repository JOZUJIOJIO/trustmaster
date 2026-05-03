import { describe, expect, it } from "vitest";
import { parseTelegramClientSession } from "@/lib/telegram/client-session";

describe("Telegram client session", () => {
  it("parses the Mini App session stored by Telegram auth", () => {
    expect(parseTelegramClientSession(JSON.stringify({
      telegramUserId: 123456,
      firstName: "Kai",
      username: "kairos_user",
      isPremium: true,
    }))).toEqual({
      telegramUserId: 123456,
      firstName: "Kai",
      username: "kairos_user",
      isPremium: true,
    });
  });

  it("rejects malformed session values", () => {
    expect(parseTelegramClientSession("{bad json")).toBeNull();
    expect(parseTelegramClientSession(JSON.stringify({ firstName: "Kai" }))).toBeNull();
  });
});
