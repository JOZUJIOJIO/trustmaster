import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock fns (available inside vi.mock factories) ---
const { mockGetAuthUser, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      }),
    }),
  }));
  const mockGetAuthUser = vi.fn();
  return { mockGetAuthUser, mockSingle, mockFrom };
});

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(() => ({ from: mockFrom })),
}));

vi.mock("@/lib/supabase/auth-guard", () => ({
  getAuthUser: mockGetAuthUser,
}));

import { POST } from "../subscription/status/route";

describe("POST /api/subscription/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns subscribed: false when user is not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue({ user: null });

    const res = await POST();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({ subscribed: false });
  });

  it("returns subscribed: true with plan details for active subscription", async () => {
    mockGetAuthUser.mockResolvedValue({
      user: { id: "user-123" },
    });

    mockSingle.mockResolvedValue({
      data: {
        status: "active",
        plan: "premium",
        current_period_end: "2026-05-01T00:00:00Z",
        cancel_at_period_end: false,
      },
      error: null,
    });

    const res = await POST();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.subscribed).toBe(true);
    expect(body.plan).toBe("premium");
    expect(body.expiresAt).toBe("2026-05-01T00:00:00Z");
    expect(body.cancelAtPeriodEnd).toBe(false);
  });

  it("returns subscribed: false when user has no active subscription", async () => {
    mockGetAuthUser.mockResolvedValue({
      user: { id: "user-456" },
    });

    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const res = await POST();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({ subscribed: false });
  });
});
