# Homepage Sanxingdui Bronze Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real Sanxingdui bronze mask and sacred tree visual background to the homepage.

**Architecture:** Keep the existing `src/app/page.tsx` homepage component and replace only the background layer markup/classes. Add focused CSS in `src/app/globals.css` for artifact image treatment, overlays, responsive positioning, and reduced-motion behavior. Add a static regression test that checks the homepage references both assets and the CSS classes needed to render them.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest.

---

### Task 1: Static Regression Test

**Files:**
- Create: `src/app/__tests__/homepage-bronze-background.test.ts`
- Modify: none

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("homepage Sanxingdui bronze background", () => {
  it("references the bronze mask and sacred tree assets", () => {
    const page = readFileSync(join(root, "src/app/page.tsx"), "utf8");

    expect(page).toContain("/images/sanxingdui-bronze-mask.jpg");
    expect(page).toContain("/images/sanxingdui-bronze-tree.jpg");
    expect(page).toContain("aria-hidden=\"true\"");
  });

  it("defines the bronze background treatment classes", () => {
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

    expect(css).toContain(".sanxingdui-artifact-mask");
    expect(css).toContain(".sanxingdui-sacred-tree");
    expect(css).toContain(".sanxingdui-ritual-grain");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/__tests__/homepage-bronze-background.test.ts`

Expected: FAIL because the homepage does not yet reference the Sanxingdui assets or CSS classes.

### Task 2: Assets and Background Implementation

**Files:**
- Create: `public/images/sanxingdui-bronze-mask.jpg`
- Create: `public/images/sanxingdui-bronze-tree.jpg`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `.gitignore`

- [ ] **Step 1: Download CC0 assets**

Download the two Wikimedia Commons source images into `public/images/` using stable filenames.

- [ ] **Step 2: Update homepage background markup**

In the cosmic and cloud background branches, add decorative `img` tags for the bronze mask and sacred tree. Mark them `aria-hidden="true"` because they are atmospheric background decoration and should not be announced by screen readers.

- [ ] **Step 3: Add CSS image treatment**

Add classes for opacity, blend mode, masks, responsive positioning, grain, and reduced-motion behavior.

- [ ] **Step 4: Run the regression test**

Run: `npm test -- src/app/__tests__/homepage-bronze-background.test.ts`

Expected: PASS.

- [ ] **Step 5: Run broader verification**

Run: `npm run lint` and `npm run build`.

Expected: both commands exit 0.
