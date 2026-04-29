import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pageArtwork } from "@/lib/page-artwork";

const root = process.cwd();

describe("page artwork registry", () => {
  it("defines artwork for the main visual pages", () => {
    expect(Object.keys(pageArtwork).sort()).toEqual([
      "about",
      "compatibility",
      "daily",
      "fortune",
      "health",
      "learn",
      "login",
      "profile",
    ]);
  });

  it("points every artwork entry at a project asset", () => {
    for (const artwork of Object.values(pageArtwork)) {
      expect(artwork.src).toMatch(/^\/images\/kairos\/.+\.webp$/);
      expect(existsSync(join(root, "public", artwork.src))).toBe(true);
      expect(artwork.alt.length).toBeGreaterThan(10);
    }
  });
});
