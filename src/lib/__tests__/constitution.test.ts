import { describe, it, expect } from "vitest";
import { calculateConstitution } from "../constitution";
import type { QuizAnswer } from "../types";

describe("calculateConstitution", () => {
  it("returns valid five-element percentages summing to 100", () => {
    const answers: QuizAnswer[] = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    const result = calculateConstitution(answers);
    const sum = Object.values(result.fiveElements).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it("returns a valid element type", () => {
    const answers: QuizAnswer[] = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    const result = calculateConstitution(answers);
    expect(["木", "火", "土", "金", "水"]).toContain(result.elementType);
  });

  it("returns a valid nine-constitution type", () => {
    const answers: QuizAnswer[] = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    const result = calculateConstitution(answers);
    const validTypes = ["平和", "气虚", "阳虚", "阴虚", "痰湿", "湿热", "血瘀", "气郁", "特禀"];
    expect(validTypes).toContain(result.constitutionType);
  });

  it("identifies yang-deficient constitution from cold-prone answers", () => {
    const answers: QuizAnswer[] = [5, 2, 4, 1, 1, 5, 5, 3, 2, 2, 5, 5, 1, 2, 2, 2, 3, 1];
    const result = calculateConstitution(answers);
    expect(result.constitutionType).toBe("阳虚");
  });

  it("identifies yin-deficient constitution from heat-prone answers", () => {
    const answers: QuizAnswer[] = [1, 3, 2, 5, 5, 1, 1, 2, 2, 5, 1, 2, 5, 5, 2, 3, 2, 1];
    const result = calculateConstitution(answers);
    expect(result.constitutionType).toBe("阴虚");
  });

  it("identifies balanced constitution when all answers are low", () => {
    const answers: QuizAnswer[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const result = calculateConstitution(answers);
    expect(result.constitutionType).toBe("平和");
  });

  it("sets secondaryType when another score is close to primary", () => {
    const answers: QuizAnswer[] = [5, 4, 5, 1, 1, 5, 5, 4, 3, 2, 5, 5, 1, 2, 3, 2, 4, 1];
    const result = calculateConstitution(answers);
    expect(result.secondaryType).not.toBeNull();
  });

  it("nine scores are all between 0 and 100", () => {
    const answers: QuizAnswer[] = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
    const result = calculateConstitution(answers);
    for (const score of Object.values(result.nineScores)) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("requires exactly 18 answers", () => {
    expect(() => calculateConstitution([1, 2, 3] as QuizAnswer[])).toThrow("Expected 18 answers");
  });
});
