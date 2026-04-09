import { describe, it, expect } from "vitest";
import { getChartHash } from "@/lib/chart-hash";

describe("getChartHash", () => {
  const sampleChart = {
    yearPillar: { stem: "甲", branch: "子" },
    monthPillar: { stem: "乙", branch: "丑" },
    dayPillar: { stem: "丙", branch: "寅" },
    hourPillar: { stem: "丁", branch: "卯" },
    gender: "male",
  };

  it("should produce a deterministic hash for the same chart input", () => {
    const hash1 = getChartHash(sampleChart);
    const hash2 = getChartHash(sampleChart);
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different charts", () => {
    const otherChart = {
      yearPillar: { stem: "戊", branch: "辰" },
      monthPillar: { stem: "己", branch: "巳" },
      dayPillar: { stem: "庚", branch: "午" },
      hourPillar: { stem: "辛", branch: "未" },
      gender: "female",
    };

    const hash1 = getChartHash(sampleChart);
    const hash2 = getChartHash(otherChart);
    expect(hash1).not.toBe(hash2);
  });

  it("should handle missing gender gracefully", () => {
    const chartNoGender = {
      yearPillar: { stem: "甲", branch: "子" },
      monthPillar: { stem: "乙", branch: "丑" },
      dayPillar: { stem: "丙", branch: "寅" },
      hourPillar: { stem: "丁", branch: "卯" },
    };

    const hash = getChartHash(chartNoGender);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");
    // Last segment is empty when gender is missing (joined as trailing hyphen)
    expect(hash).toMatch(/-$/);
  });

  it('should produce hash in format "stem-branch-stem-branch-stem-branch-stem-branch-gender"', () => {
    const hash = getChartHash(sampleChart);
    expect(hash).toBe("甲-子-乙-丑-丙-寅-丁-卯-male");
  });
});
