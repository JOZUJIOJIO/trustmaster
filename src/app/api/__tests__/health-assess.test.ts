import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Hoisted mock fns ---
const { mockGetUser, mockSingle, mockFrom, mockCalculateConstitution } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    }),
  }));
  const mockCalculateConstitution = vi.fn();
  return { mockGetUser, mockSingle, mockFrom, mockCalculateConstitution };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/constitution", () => ({
  calculateConstitution: mockCalculateConstitution,
}));

import { POST } from "../health/assess/route";

// Helper: valid 18 answers (all value 3)
const validAnswers = Array.from({ length: 18 }, () => 3);

describe("POST /api/health/assess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request("http://localhost/api/health/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: validAnswers }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Authentication required");
  });

  it("returns 400 when answers array has wrong length", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const req = new Request("http://localhost/api/health/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [1, 2, 3] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Expected 18 answers");
  });

  it("returns 400 when answer values are out of range", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const badAnswers = Array.from({ length: 18 }, () => 9);

    const req = new Request("http://localhost/api/health/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: badAnswers }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Each answer must be 1-5");
  });

  it("returns 200 with constitution result for valid answers", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const constitutionResult = {
      elementType: "木",
      constitutionType: "平和",
      secondaryType: null,
      fiveElements: { 木: 30, 火: 20, 土: 20, 金: 15, 水: 15 },
      nineScores: { 平和: 80, 气虚: 20 },
    };

    mockCalculateConstitution.mockReturnValue(constitutionResult);

    mockSingle.mockResolvedValue({
      data: { id: "assessment-abc" },
      error: null,
    });

    const req = new Request("http://localhost/api/health/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: validAnswers, baziChartHash: "hash123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.assessmentId).toBe("assessment-abc");
    expect(body.preview.elementType).toBe("木");
    expect(body.preview.constitutionType).toBe("平和");
    expect(body.preview.secondaryType).toBeNull();
  });

  it("returns 500 when database insert fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    mockCalculateConstitution.mockReturnValue({
      elementType: "火",
      constitutionType: "气虚",
      secondaryType: null,
      fiveElements: { 木: 20, 火: 30, 土: 20, 金: 15, 水: 15 },
      nineScores: {},
    });

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "DB write failed" },
    });

    const req = new Request("http://localhost/api/health/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: validAnswers }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Failed to save assessment");
  });
});
