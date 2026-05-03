import { describe, expect, it } from "vitest";
import { resolveTelegramRedirectPath } from "@/lib/telegram/navigation";

describe("Telegram navigation", () => {
  it("keeps Telegram-native fortune redirects intact", () => {
    expect(resolveTelegramRedirectPath("/fortune?paid=pending")).toBe("/fortune?paid=pending");
  });

  it("reroutes Supabase-only account pages back to the Mini App home", () => {
    expect(resolveTelegramRedirectPath("/login?redirect=/profile")).toBe("/tg");
    expect(resolveTelegramRedirectPath("/health/quiz")).toBe("/tg");
  });

  it("allows the Telegram-aware profile page", () => {
    expect(resolveTelegramRedirectPath("/profile")).toBe("/profile");
  });
});
