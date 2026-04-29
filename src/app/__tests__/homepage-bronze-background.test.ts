import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("homepage Sanxingdui bronze background", () => {
  it("references the bronze mask and sacred tree assets", () => {
    const page = readFileSync(join(root, "src/app/page.tsx"), "utf8");

    expect(page).toContain("/images/sanxingdui-bronze-mask.jpg");
    expect(page).toContain("/images/sanxingdui-bronze-tree.jpg");
    expect(page).toContain('aria-hidden="true"');
  });

  it("defines the bronze background treatment classes", () => {
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

    expect(css).toContain(".sanxingdui-artifact-mask");
    expect(css).toContain(".sanxingdui-sacred-tree");
    expect(css).toContain(".sanxingdui-ritual-grain");
  });
});
