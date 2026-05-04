import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("Telegram profile experience", () => {
  it("does not redirect Telegram users back to login", () => {
    const page = readFileSync(join(root, "src/app/profile/page.tsx"), "utf8");

    expect(page).toContain("telegramUser");
    expect(page).toContain("!user && !telegramUser");
  });

  it("surfaces Stars access and invite benefits for Telegram users", () => {
    const page = readFileSync(join(root, "src/app/profile/page.tsx"), "utf8");

    expect(page).toContain("Stars Wallet");
    expect(page).toContain("我的星星权益");
    expect(page).toContain("isTelegramMiniAppPreviewRuntime");
    expect(page).toContain("Kairos 体验用户");
    expect(page).toContain("telegramInviteLink");
    expect(page).toContain("formatStarsPrice");
    expect(page).toContain("邀请好友");
    expect(page).not.toContain("Managed Bots");
    expect(page).not.toContain("Affiliate Program");
  });

  it("authenticates Telegram before protected pages decide to redirect", () => {
    const context = readFileSync(join(root, "src/lib/supabase/auth-context.tsx"), "utf8");

    expect(context).toContain("authenticateTelegramFromWebApp");
    expect(context).toContain("/api/telegram/auth");
  });
});
