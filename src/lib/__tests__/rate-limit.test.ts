import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow the first request", () => {
    const result = checkRateLimit("test-first", 5, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("should allow requests up to the limit", () => {
    const key = "test-up-to-limit";
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      const result = checkRateLimit(key, limit, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("should reject requests beyond the limit", () => {
    const key = "test-beyond-limit";
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      checkRateLimit(key, limit, 60_000);
    }

    const result = checkRateLimit(key, limit, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should allow requests again after the window expires", () => {
    const key = "test-window-expiry";
    const limit = 2;
    const windowMs = 60_000;

    // Exhaust the limit
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(windowMs + 1);

    const result = checkRateLimit(key, limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(limit - 1);
  });

  it("should decrement remaining count correctly", () => {
    const key = "test-remaining";
    const limit = 5;

    const r1 = checkRateLimit(key, limit, 60_000);
    expect(r1.remaining).toBe(4);

    const r2 = checkRateLimit(key, limit, 60_000);
    expect(r2.remaining).toBe(3);

    const r3 = checkRateLimit(key, limit, 60_000);
    expect(r3.remaining).toBe(2);

    const r4 = checkRateLimit(key, limit, 60_000);
    expect(r4.remaining).toBe(1);

    const r5 = checkRateLimit(key, limit, 60_000);
    expect(r5.remaining).toBe(0);
  });
});
