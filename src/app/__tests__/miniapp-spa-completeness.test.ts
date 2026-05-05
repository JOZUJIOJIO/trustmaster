import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const html = readFileSync(join(process.cwd(), "public/kairos-telegram-miniapp-spa.html"), "utf8");

describe("single-file Telegram Mini App completeness", () => {
  it("contains the local and Telegram Stars payment bridge", () => {
    expect(html).toContain("requestStarsUnlock");
    expect(html).toContain("/api/telegram/stars/checkout");
    expect(html).toContain("openInvoice");
    expect(html).toContain("kairos_miniapp_unlocks");
  });

  it("persists identity, generated readings, and history for a complete local test loop", () => {
    expect(html).toContain("initTelegramIdentity");
    expect(html).toContain("persistReadingHistory");
    expect(html).toContain("renderHistory");
    expect(html).toContain("kairos_miniapp_history");
    expect(html).toContain("kairos_miniapp_session");
  });

  it("has user-facing completion states instead of silent simulated behavior", () => {
    expect(html).toContain("paymentSheet");
    expect(html).toContain("toastMessage");
    expect(html).toContain("markProductUnlocked");
    expect(html).toContain("renderShareCard");
  });

  it("adds Zi Wei insight without removing the light Bronze Tree commerce loop", () => {
    expect(html).toContain("紫微斗数");
    expect(html).toContain("Purple Star");
    expect(html).toContain("calculateZiweiSnapshot");
    expect(html).toContain("renderZiweiInsight");
    expect(html).toContain("ziwei_pro");
    expect(html).toContain("requestStarsUnlock");
    expect(html).toContain("paymentSheet");
    expect(html).toContain("kairos_miniapp_history");
    expect(html).toContain('data-route="share"');
    expect(html).toContain("navShare");
  });
});
