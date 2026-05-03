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

  it("authenticates Telegram before protected pages decide to redirect", () => {
    const context = readFileSync(join(root, "src/lib/supabase/auth-context.tsx"), "utf8");

    expect(context).toContain("authenticateTelegramFromWebApp");
    expect(context).toContain("/api/telegram/auth");
  });
});
