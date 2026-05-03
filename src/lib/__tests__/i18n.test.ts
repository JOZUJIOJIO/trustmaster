import { describe, it, expect } from "vitest";
import { t } from "@/lib/i18n";

describe("t (translation lookup)", () => {
  it("should return the correct string for Thai locale", () => {
    expect(t("th", "app.tagline")).toBe("สัมผัสพลังแห่งตะวันออก");
  });

  it("should return the correct string for English locale", () => {
    expect(t("en", "app.tagline")).toBe("Eastern Self-Reflection Meets AI");
  });

  it("should return the correct string for Chinese locale", () => {
    expect(t("zh", "app.tagline")).toBe("青铜文明里的自我洞察");
  });

  it("should return the key itself when the key does not exist in any locale", () => {
    const missingKey = "nonexistent.key.that.does.not.exist";
    expect(t("en", missingKey)).toBe(missingKey);
    expect(t("th", missingKey)).toBe(missingKey);
  });

  it("should return different output when switching locale", () => {
    const thResult = t("th", "app.tagline");
    const enResult = t("en", "app.tagline");
    const zhResult = t("zh", "app.tagline");

    expect(thResult).not.toBe(enResult);
    expect(enResult).not.toBe(zhResult);
    expect(thResult).not.toBe(zhResult);
  });
});
