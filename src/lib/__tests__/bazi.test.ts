/**
 * Unit tests for the BaZi calculation engine.
 *
 * Reference values computed via lunar-javascript directly and cross-checked
 * against the implementation in src/lib/bazi.ts.
 */

import { describe, it, expect } from "vitest";
import { calculateBazi, getTenGod } from "../bazi";

// ===== Reference Date Tests =====

describe("calculateBazi — 1990-01-15, 午时, male", () => {
  const chart = calculateBazi(1990, 1, 15, "午", "male");

  it("year pillar is 己巳", () => {
    expect(chart.yearPillar.stem).toBe("己");
    expect(chart.yearPillar.branch).toBe("巳");
    expect(chart.yearPillar.stemElement).toBe("土");
    expect(chart.yearPillar.branchElement).toBe("火");
  });

  it("month pillar is 丁丑", () => {
    expect(chart.monthPillar.stem).toBe("丁");
    expect(chart.monthPillar.branch).toBe("丑");
    expect(chart.monthPillar.stemElement).toBe("火");
    expect(chart.monthPillar.branchElement).toBe("土");
  });

  it("day pillar is 庚辰", () => {
    expect(chart.dayPillar.stem).toBe("庚");
    expect(chart.dayPillar.branch).toBe("辰");
    expect(chart.dayPillar.stemElement).toBe("金");
    expect(chart.dayPillar.branchElement).toBe("土");
  });

  it("hour pillar is 壬午", () => {
    expect(chart.hourPillar.stem).toBe("壬");
    expect(chart.hourPillar.branch).toBe("午");
    expect(chart.hourPillar.stemElement).toBe("水");
    expect(chart.hourPillar.branchElement).toBe("火");
  });

  it("dayMaster is 庚 (金)", () => {
    expect(chart.dayMaster).toBe("庚");
    expect(chart.dayMasterElement).toBe("金");
  });

  it("fiveElements counts are correct (includes weighted hidden stems)", () => {
    // Weighted: stems+branches each count 1, hidden stems use weights 1.0/0.5/0.3
    expect(chart.fiveElements["木"]).toBeCloseTo(0.5, 1);
    expect(chart.fiveElements["火"]).toBeCloseTo(5, 1);
    expect(chart.fiveElements["土"]).toBeCloseTo(5.8, 1);
    expect(chart.fiveElements["金"]).toBeCloseTo(1.8, 1);
    expect(chart.fiveElements["水"]).toBeCloseTo(1.8, 1);
  });

  it("zodiacAnimal is 蛇", () => {
    expect(chart.zodiacAnimal).toBe("蛇");
  });

  it("tenGods are non-empty strings", () => {
    expect(chart.tenGods.year).toBeTruthy();
    expect(chart.tenGods.month).toBeTruthy();
    expect(chart.tenGods.hour).toBeTruthy();
  });

  it("luckCycles has 8 entries", () => {
    expect(chart.luckCycles).toHaveLength(8);
  });

  it("luckCycles first entry stem is 丙 and branch is 子", () => {
    expect(chart.luckCycles[0].stem).toBe("丙");
    expect(chart.luckCycles[0].branch).toBe("子");
  });
});

describe("calculateBazi — 2000-06-15, 子时, female", () => {
  const chart = calculateBazi(2000, 6, 15, "子", "female");

  it("year pillar is 庚辰", () => {
    expect(chart.yearPillar.stem).toBe("庚");
    expect(chart.yearPillar.branch).toBe("辰");
    expect(chart.yearPillar.stemElement).toBe("金");
    expect(chart.yearPillar.branchElement).toBe("土");
  });

  it("month pillar is 壬午", () => {
    expect(chart.monthPillar.stem).toBe("壬");
    expect(chart.monthPillar.branch).toBe("午");
    expect(chart.monthPillar.stemElement).toBe("水");
    expect(chart.monthPillar.branchElement).toBe("火");
  });

  it("day pillar is 甲辰", () => {
    expect(chart.dayPillar.stem).toBe("甲");
    expect(chart.dayPillar.branch).toBe("辰");
    expect(chart.dayPillar.stemElement).toBe("木");
    expect(chart.dayPillar.branchElement).toBe("土");
  });

  it("hour pillar is 甲子", () => {
    expect(chart.hourPillar.stem).toBe("甲");
    expect(chart.hourPillar.branch).toBe("子");
    expect(chart.hourPillar.stemElement).toBe("木");
    expect(chart.hourPillar.branchElement).toBe("水");
  });

  it("dayMaster is 甲 (木)", () => {
    expect(chart.dayMaster).toBe("甲");
    expect(chart.dayMasterElement).toBe("木");
  });

  it("fiveElements counts are correct (includes weighted hidden stems)", () => {
    expect(chart.fiveElements["木"]).toBeCloseTo(3, 1);
    expect(chart.fiveElements["火"]).toBeCloseTo(2, 1);
    expect(chart.fiveElements["土"]).toBeCloseTo(4.5, 1);
    expect(chart.fiveElements["金"]).toBeCloseTo(1, 1);
    expect(chart.fiveElements["水"]).toBeCloseTo(3.6, 1);
  });

  it("zodiacAnimal is 龙", () => {
    expect(chart.zodiacAnimal).toBe("龙");
  });

  it("tenGods are non-empty strings", () => {
    expect(chart.tenGods.year).toBeTruthy();
    expect(chart.tenGods.month).toBeTruthy();
    expect(chart.tenGods.hour).toBeTruthy();
  });

  it("luckCycles has 8 entries", () => {
    expect(chart.luckCycles).toHaveLength(8);
  });

  it("luckCycles first entry stem is 辛 and branch is 巳", () => {
    expect(chart.luckCycles[0].stem).toBe("辛");
    expect(chart.luckCycles[0].branch).toBe("巳");
  });
});

describe("calculateBazi — 1985-03-20, 卯时, male", () => {
  const chart = calculateBazi(1985, 3, 20, "卯", "male");

  it("year pillar is 乙丑", () => {
    expect(chart.yearPillar.stem).toBe("乙");
    expect(chart.yearPillar.branch).toBe("丑");
    expect(chart.yearPillar.stemElement).toBe("木");
    expect(chart.yearPillar.branchElement).toBe("土");
  });

  it("month pillar is 己卯", () => {
    expect(chart.monthPillar.stem).toBe("己");
    expect(chart.monthPillar.branch).toBe("卯");
    expect(chart.monthPillar.stemElement).toBe("土");
    expect(chart.monthPillar.branchElement).toBe("木");
  });

  it("day pillar is 戊午", () => {
    expect(chart.dayPillar.stem).toBe("戊");
    expect(chart.dayPillar.branch).toBe("午");
    expect(chart.dayPillar.stemElement).toBe("土");
    expect(chart.dayPillar.branchElement).toBe("火");
  });

  it("hour pillar is 乙卯", () => {
    expect(chart.hourPillar.stem).toBe("乙");
    expect(chart.hourPillar.branch).toBe("卯");
    expect(chart.hourPillar.stemElement).toBe("木");
    expect(chart.hourPillar.branchElement).toBe("木");
  });

  it("dayMaster is 戊 (土)", () => {
    expect(chart.dayMaster).toBe("戊");
    expect(chart.dayMasterElement).toBe("土");
  });

  it("fiveElements counts are correct (includes weighted hidden stems)", () => {
    expect(chart.fiveElements["木"]).toBeCloseTo(6, 1);
    expect(chart.fiveElements["火"]).toBeCloseTo(2, 1);
    expect(chart.fiveElements["土"]).toBeCloseTo(4.5, 1);
    expect(chart.fiveElements["金"]).toBeCloseTo(0.3, 1);
    expect(chart.fiveElements["水"]).toBeCloseTo(0.5, 1);
  });

  it("zodiacAnimal is 牛", () => {
    expect(chart.zodiacAnimal).toBe("牛");
  });

  it("tenGods are non-empty strings", () => {
    expect(chart.tenGods.year).toBeTruthy();
    expect(chart.tenGods.month).toBeTruthy();
    expect(chart.tenGods.hour).toBeTruthy();
  });

  it("luckCycles has 8 entries", () => {
    expect(chart.luckCycles).toHaveLength(8);
  });

  it("luckCycles first entry stem is 戊 and branch is 寅", () => {
    expect(chart.luckCycles[0].stem).toBe("戊");
    expect(chart.luckCycles[0].branch).toBe("寅");
  });
});

// ===== getTenGod tests =====

describe("getTenGod — all 10 relationships", () => {
  it("same stem, same polarity (甲→甲) → 比肩", () => {
    expect(getTenGod("甲", "甲")).toBe("比肩");
  });

  it("same element, different polarity (甲→乙) → 劫财", () => {
    expect(getTenGod("甲", "乙")).toBe("劫财");
  });

  it("generate_yang: 甲→丙 (木生火, both yang) → 食神", () => {
    expect(getTenGod("甲", "丙")).toBe("食神");
  });

  it("generate_yin: 甲→丁 (木生火, different polarity) → 伤官", () => {
    expect(getTenGod("甲", "丁")).toBe("伤官");
  });

  it("wealth_yang: 甲→戊 (木克土, both yang) → 偏财", () => {
    expect(getTenGod("甲", "戊")).toBe("偏财");
  });

  it("wealth_yin: 甲→己 (木克土, different polarity) → 正财", () => {
    expect(getTenGod("甲", "己")).toBe("正财");
  });

  it("officer_yang: 甲→庚 (金克木, both yang) → 七杀", () => {
    expect(getTenGod("甲", "庚")).toBe("七杀");
  });

  it("officer_yin: 甲→辛 (金克木, different polarity) → 正官", () => {
    expect(getTenGod("甲", "辛")).toBe("正官");
  });

  it("seal_yang: 甲→壬 (水生木, both yang) → 偏印", () => {
    expect(getTenGod("甲", "壬")).toBe("偏印");
  });

  it("seal_yin: 甲→癸 (水生木, different polarity) → 正印", () => {
    expect(getTenGod("甲", "癸")).toBe("正印");
  });
});

// ===== Edge case tests =====

describe("calculateBazi — edge cases", () => {
  it("leap year date 2000-02-29 returns valid chart", () => {
    const chart = calculateBazi(2000, 2, 29, "子", "male");
    expect(chart.dayPillar.stem).toBe("丁");
    expect(chart.dayPillar.branch).toBe("巳");
    expect(chart.dayMaster).toBe("丁");
    expect(chart.dayMasterElement).toBe("火");
    expect(chart.luckCycles).toHaveLength(8);
    expect(chart.zodiacAnimal).toBeTruthy();
  });

  it("year boundary 2000-01-01 returns valid chart", () => {
    const chart = calculateBazi(2000, 1, 1, "子", "male");
    expect(chart.dayPillar.stem).toBe("戊");
    expect(chart.dayPillar.branch).toBe("午");
    expect(chart.dayMaster).toBe("戊");
    expect(chart.dayMasterElement).toBe("土");
    expect(chart.luckCycles).toHaveLength(8);
    expect(chart.zodiacAnimal).toBeTruthy();
  });

  it("very old date 1940-01-01 returns valid chart", () => {
    const chart = calculateBazi(1940, 1, 1, "子", "male");
    expect(chart.dayPillar.stem).toBe("癸");
    expect(chart.dayPillar.branch).toBe("卯");
    expect(chart.dayMaster).toBe("癸");
    expect(chart.dayMasterElement).toBe("水");
    expect(chart.luckCycles).toHaveLength(8);
    expect(chart.zodiacAnimal).toBeTruthy();
  });

  it("all edge case charts return non-empty solarDate", () => {
    const dates: [number, number, number][] = [
      [2000, 2, 29],
      [2000, 1, 1],
      [1940, 1, 1],
    ];
    for (const [y, m, d] of dates) {
      const chart = calculateBazi(y, m, d, "子", "male");
      expect(chart.solarDate).toBeTruthy();
    }
  });
});

// ===== Structural integrity tests =====

describe("calculateBazi — return shape", () => {
  const chart = calculateBazi(1990, 1, 15, "午", "male");

  it("pillar hiddenStems are arrays", () => {
    expect(Array.isArray(chart.yearPillar.hiddenStems)).toBe(true);
    expect(Array.isArray(chart.monthPillar.hiddenStems)).toBe(true);
    expect(Array.isArray(chart.dayPillar.hiddenStems)).toBe(true);
    expect(Array.isArray(chart.hourPillar.hiddenStems)).toBe(true);
  });

  it("fiveElements keys cover all five elements", () => {
    const keys = Object.keys(chart.fiveElements);
    expect(keys).toContain("木");
    expect(keys).toContain("火");
    expect(keys).toContain("土");
    expect(keys).toContain("金");
    expect(keys).toContain("水");
  });

  it("luckCycles each entry has required fields", () => {
    for (const cycle of chart.luckCycles) {
      expect(cycle.stem).toBeTruthy();
      expect(cycle.branch).toBeTruthy();
      expect(cycle.element).toBeTruthy();
      expect(typeof cycle.startAge).toBe("number");
    }
  });

  it("gender is preserved in output", () => {
    expect(chart.gender).toBe("male");
    const femaleChart = calculateBazi(1990, 1, 15, "午", "female");
    expect(femaleChart.gender).toBe("female");
  });

  it("dayMasterStrength is 'strong' or 'weak'", () => {
    expect(["strong", "weak"]).toContain(chart.dayMasterStrength);
  });

  it("nayin has entries for all four pillars", () => {
    expect(chart.nayin).toHaveProperty("year");
    expect(chart.nayin).toHaveProperty("month");
    expect(chart.nayin).toHaveProperty("day");
    expect(chart.nayin).toHaveProperty("hour");
  });
});
