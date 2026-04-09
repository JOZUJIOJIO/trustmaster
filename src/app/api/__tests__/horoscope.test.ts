import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock fns ---
const { mockSingle, mockCreate, mockUpsert, mockCheckRateLimit } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockUpsert = vi.fn(() => ({ then: vi.fn() }));
  const mockCreate = vi.fn();
  const mockCheckRateLimit = vi.fn(() => ({ allowed: true, remaining: 5 }));
  return { mockSingle, mockCreate, mockUpsert, mockCheckRateLimit };
});

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      }),
      upsert: mockUpsert,
    })),
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
}));

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: mockCreate } };
  },
}));

import { POST } from "../horoscope/route";

describe("POST /api/horoscope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default: allow requests
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 5 });
  });

  it("returns 400 when required parameters are missing", async () => {
    const req = new Request("http://localhost/api/horoscope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sign: "aries" }), // missing signName and locale
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Missing parameters");
  });

  it("returns cached data on cache hit (200)", async () => {
    const cachedData = {
      sign: "aries",
      signName: "Aries",
      date: "2026-04-09",
      overall: "Great day!",
      love: "Love is in the air",
      career: "Productive",
      finance: "Good",
      health: "Strong",
      luckyNumber: 7,
      luckyColor: "Red",
      rating: 4,
    };

    mockSingle.mockResolvedValue({
      data: { data: cachedData },
      error: null,
    });

    const req = new Request("http://localhost/api/horoscope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sign: "aries", signName: "Aries", locale: "en" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual(cachedData);
    // OpenAI should NOT have been called since cache hit
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("generates via AI on cache miss and returns expected fields", async () => {
    // Cache miss
    mockSingle.mockResolvedValue({ data: null, error: null });

    const aiResponse = {
      overall: "A wonderful day ahead",
      love: "Romance awaits",
      career: "Focus on teamwork",
      finance: "Steady income",
      health: "Stay hydrated",
      luckyNumber: 3,
      luckyColor: "Blue",
      rating: 5,
    };

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(aiResponse) } }],
    });

    const req = new Request("http://localhost/api/horoscope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sign: "aries", signName: "Aries", locale: "en" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.sign).toBe("aries");
    expect(body.signName).toBe("Aries");
    expect(body.overall).toBe(aiResponse.overall);
    expect(body.luckyNumber).toBe(3);
    expect(body.rating).toBe(5);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0 });

    const req = new Request("http://localhost/api/horoscope", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify({ sign: "aries", signName: "Aries", locale: "en" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(429);
  });
});
