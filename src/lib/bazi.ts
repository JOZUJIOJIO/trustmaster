/**
 * BaZi (八字) Precise Calculation Engine
 * All calculations are deterministic — no AI, no randomness.
 */

// @ts-expect-error lunar-javascript has no type declarations
import { Solar, Lunar } from "lunar-javascript";
import { NAYIN_TABLE, DAY_MASTER_DESC } from "./bazi-glossary";

// ===== Constants =====

const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const STEM_ELEMENTS: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const BRANCH_ELEMENTS: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

const BRANCH_ANIMALS: Record<string, string> = {
  子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇",
  午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪",
};

const ANIMAL_EMOJI: Record<string, string> = {
  鼠: "🐀", 牛: "🐂", 虎: "🐅", 兔: "🐇", 龙: "🐉", 蛇: "🐍",
  马: "🐴", 羊: "🐏", 猴: "🐒", 鸡: "🐓", 狗: "🐕", 猪: "🐖",
};

const ELEMENT_EMOJI: Record<string, string> = {
  木: "🌳", 火: "🔥", 土: "⛰️", 金: "⚙️", 水: "💧",
};

const ELEMENT_COLORS: Record<string, string> = {
  木: "#22c55e", 火: "#ef4444", 土: "#a3712a", 金: "#f59e0b", 水: "#3b82f6",
};

// Hidden stems in each Earthly Branch (藏干)
const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["癸"], 丑: ["己", "癸", "辛"], 寅: ["甲", "丙", "戊"], 卯: ["乙"],
  辰: ["戊", "乙", "癸"], 巳: ["丙", "庚", "戊"], 午: ["丁", "己"], 未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"], 酉: ["辛"], 戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"],
};

// Chinese hours (时辰)
const CHINESE_HOURS = [
  { name: "子时", branch: "子", start: "23:00", end: "01:00", label: "23:00-01:00" },
  { name: "丑时", branch: "丑", start: "01:00", end: "03:00", label: "01:00-03:00" },
  { name: "寅时", branch: "寅", start: "03:00", end: "05:00", label: "03:00-05:00" },
  { name: "卯时", branch: "卯", start: "05:00", end: "07:00", label: "05:00-07:00" },
  { name: "辰时", branch: "辰", start: "07:00", end: "09:00", label: "07:00-09:00" },
  { name: "巳时", branch: "巳", start: "09:00", end: "11:00", label: "09:00-11:00" },
  { name: "午时", branch: "午", start: "11:00", end: "13:00", label: "11:00-13:00" },
  { name: "未时", branch: "未", start: "13:00", end: "15:00", label: "13:00-15:00" },
  { name: "申时", branch: "申", start: "15:00", end: "17:00", label: "15:00-17:00" },
  { name: "酉时", branch: "酉", start: "17:00", end: "19:00", label: "17:00-19:00" },
  { name: "戌时", branch: "戌", start: "19:00", end: "21:00", label: "19:00-21:00" },
  { name: "亥时", branch: "亥", start: "21:00", end: "23:00", label: "21:00-23:00" },
];

// Ten Gods (十神) mapping based on Day Stem relationship
const TEN_GODS_MAP: Record<string, string> = {
  "same_yang": "比肩", "same_yin": "劫财",
  "generate_yang": "食神", "generate_yin": "伤官",
  "wealth_yang": "偏财", "wealth_yin": "正财",
  "officer_yang": "七杀", "officer_yin": "正官",
  "seal_yang": "偏印", "seal_yin": "正印",
};

// Five Elements generation & control cycles
const ELEMENT_GENERATES: Record<string, string> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};
const ELEMENT_CONTROLS: Record<string, string> = {
  木: "土", 火: "金", 土: "水", 金: "木", 水: "火",
};

// ===== Types =====

export interface Pillar {
  stem: string;       // 天干
  branch: string;     // 地支
  stemElement: string; // 天干五行
  branchElement: string; // 地支五行
  animal: string;      // 生肖
  hiddenStems: string[]; // 藏干
}

export interface FiveElementCount {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

export interface BaziChart {
  // Input
  solarDate: string;      // 公历日期
  lunarDate: string;      // 农历日期
  lunarMonthChinese: string; // 农历月份中文
  lunarDayChinese: string;   // 农历日中文
  lunarYearChinese: string;  // 农历年中文（天干地支）
  gender: "male" | "female";
  birthHour: string;      // 时辰名

  // Four Pillars
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;

  // Analysis
  dayMaster: string;       // 日主（日干）
  dayMasterElement: string; // 日主五行
  fiveElements: FiveElementCount;
  luckyElement: string;     // 喜用神
  zodiacAnimal: string;     // 生肖
  zodiacEmoji: string;      // 生肖 emoji
  westernZodiac: string;    // 西洋星座
  westernZodiacSymbol: string;

  // Enhanced analysis
  tenGods: { year: string; month: string; hour: string }; // Ten Gods for each pillar stem
  nayin: { year: string; month: string; day: string; hour: string }; // Nayin for each pillar
  dayMasterStrength: "strong" | "weak";
  dayMasterScore: number; // 0-100
  dayMasterDesc: string;
  dayMasterDescEn: string;
  unluckyElement: string; // 忌神
  currentYearStem: string;
  currentYearBranch: string;
  currentYearNayin: string;

  // Metadata
  elementColors: Record<string, string>;
  elementEmoji: Record<string, string>;
}

// ===== Helper Functions =====

function getStemYinYang(stem: string): "yang" | "yin" {
  return HEAVENLY_STEMS.indexOf(stem) % 2 === 0 ? "yang" : "yin";
}

function getElementRelation(dayStemElement: string, targetElement: string): string {
  if (dayStemElement === targetElement) return "same";
  if (ELEMENT_GENERATES[dayStemElement] === targetElement) return "generate";
  if (ELEMENT_CONTROLS[dayStemElement] === targetElement) return "wealth";
  if (ELEMENT_CONTROLS[targetElement] === dayStemElement) return "officer";
  if (ELEMENT_GENERATES[targetElement] === dayStemElement) return "seal";
  return "same";
}

export function getTenGod(dayStem: string, targetStem: string): string {
  const dayElement = STEM_ELEMENTS[dayStem];
  const targetElement = STEM_ELEMENTS[targetStem];
  const relation = getElementRelation(dayElement, targetElement);
  const dayYY = getStemYinYang(dayStem);
  const targetYY = getStemYinYang(targetStem);
  const samePolarity = dayYY === targetYY;
  const key = `${relation}_${samePolarity ? "yang" : "yin"}`;
  return TEN_GODS_MAP[key] || "";
}

function determineLuckyElement(fiveElements: FiveElementCount, dayMasterElement: string): string {
  // Simplified lucky element determination:
  // If Day Master is weak (few supporting elements), lucky element = element that generates it
  // If Day Master is strong, lucky element = element that controls it

  const dayCount = fiveElements[dayMasterElement as keyof FiveElementCount];
  const total = Object.values(fiveElements).reduce((a, b) => a + b, 0);
  const isStrong = dayCount >= total / 5 * 1.5;

  if (isStrong) {
    // Need to drain: element that Day Master generates
    return ELEMENT_GENERATES[dayMasterElement];
  } else {
    // Need support: element that generates Day Master
    const generators = Object.entries(ELEMENT_GENERATES).find(([, v]) => v === dayMasterElement);
    return generators ? generators[0] : dayMasterElement;
  }
}

function getWesternZodiac(month: number, day: number): { name: string; symbol: string } {
  const zodiacData = [
    { name: "摩羯座", symbol: "♑", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { name: "水瓶座", symbol: "♒", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { name: "双鱼座", symbol: "♓", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { name: "白羊座", symbol: "♈", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { name: "金牛座", symbol: "♉", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { name: "双子座", symbol: "♊", startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
    { name: "巨蟹座", symbol: "♋", startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
    { name: "狮子座", symbol: "♌", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { name: "处女座", symbol: "♍", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { name: "天秤座", symbol: "♎", startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
    { name: "天蝎座", symbol: "♏", startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
    { name: "射手座", symbol: "♐", startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
  ];

  const dateNum = month * 100 + day;
  // Capricorn spans year boundary
  if (dateNum >= 1222 || dateNum <= 119) return zodiacData[0];

  for (const z of zodiacData) {
    const start = z.startMonth * 100 + z.startDay;
    const end = z.endMonth * 100 + z.endDay;
    if (dateNum >= start && dateNum <= end) return { name: z.name, symbol: z.symbol };
  }
  return zodiacData[0];
}

// ===== Main Calculation =====

export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hourBranch: string, // "子" | "丑" | ... | "亥"
  gender: "male" | "female"
): BaziChart {
  // Use lunar-javascript for precise conversion
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // Four Pillars from lunar-javascript (precise calculation)
  const yearStem = eightChar.getYearGan();
  const yearBranch = eightChar.getYearZhi();
  const monthStem = eightChar.getMonthGan();
  const monthBranch = eightChar.getMonthZhi();
  const dayStem = eightChar.getDayGan();
  const dayBranch = eightChar.getDayZhi();

  // Hour pillar calculation
  const dayIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const hourBranchIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
  // 日上起时法：甲己还加甲，乙庚丙作初...
  const hourStemBase = [0, 2, 4, 6, 8]; // 甲, 丙, 戊, 庚, 壬
  const hourStemStart = hourStemBase[dayIndex % 5];
  const hourStemIndex = (hourStemStart + hourBranchIndex) % 10;
  const hourStem = HEAVENLY_STEMS[hourStemIndex];

  // Build pillars
  const buildPillar = (stem: string, branch: string): Pillar => ({
    stem,
    branch,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    animal: BRANCH_ANIMALS[branch],
    hiddenStems: HIDDEN_STEMS[branch] || [],
  });

  const yearPillar = buildPillar(yearStem, yearBranch);
  const monthPillar = buildPillar(monthStem, monthBranch);
  const dayPillar = buildPillar(dayStem, dayBranch);
  const hourPillar = buildPillar(hourStem, hourBranch);

  // Count Five Elements (天干 + 地支 + 藏干)
  const fiveElements: FiveElementCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  for (const p of allPillars) {
    fiveElements[p.stemElement as keyof FiveElementCount]++;
    fiveElements[p.branchElement as keyof FiveElementCount]++;
  }

  const dayMasterElement = STEM_ELEMENTS[dayStem];
  const luckyElement = determineLuckyElement(fiveElements, dayMasterElement);

  // Lunar date info
  const lunarDate = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  const lunarMonthChinese = lunar.getMonthInChinese() + "月";
  const lunarDayChinese = lunar.getDayInChinese();
  const lunarYearChinese = lunar.getYearInGanZhi() + "年";

  // Zodiac
  const zodiacAnimal = BRANCH_ANIMALS[yearBranch];
  const westernZodiac = getWesternZodiac(month, day);

  // Birth hour name
  const hourInfo = CHINESE_HOURS.find((h) => h.branch === hourBranch);

  // Ten Gods
  const tenGods = {
    year: getTenGod(dayStem, yearStem),
    month: getTenGod(dayStem, monthStem),
    hour: getTenGod(dayStem, hourStem),
  };

  // Nayin
  const nayin = {
    year: NAYIN_TABLE[yearStem + yearBranch] || "",
    month: NAYIN_TABLE[monthStem + monthBranch] || "",
    day: NAYIN_TABLE[dayStem + dayBranch] || "",
    hour: NAYIN_TABLE[hourStem + hourBranch] || "",
  };

  // Day Master strength (simplified scoring)
  const supportCount = fiveElements[dayMasterElement as keyof FiveElementCount];
  // Element that generates day master
  const generatorEl = Object.entries(ELEMENT_GENERATES).find(([, v]) => v === dayMasterElement)?.[0] || "";
  const generatorCount = generatorEl ? fiveElements[generatorEl as keyof FiveElementCount] : 0;
  const totalSupport = supportCount + generatorCount;
  const total = Object.values(fiveElements).reduce((a, b) => a + b, 0);
  const dayMasterScore = Math.min(100, Math.round((totalSupport / total) * 100 * 2));
  const dayMasterStrength = dayMasterScore >= 50 ? "strong" as const : "weak" as const;

  // Day Master personality
  const dmDesc = DAY_MASTER_DESC[dayStem] || { trait: "", traitEn: "" };

  // Unlucky element (忌神) — opposite of lucky
  const unluckyElement = ELEMENT_CONTROLS[luckyElement] || "";

  // Current year
  const now = new Date();
  const currentSolar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const currentLunar = currentSolar.getLunar();
  const currentEC = currentLunar.getEightChar();
  const currentYearStem = currentEC.getYearGan();
  const currentYearBranch = currentEC.getYearZhi();
  const currentYearNayin = NAYIN_TABLE[currentYearStem + currentYearBranch] || "";

  return {
    solarDate: `${year}年${month}月${day}日`,
    lunarDate,
    lunarMonthChinese,
    lunarDayChinese,
    lunarYearChinese,
    gender,
    birthHour: hourInfo?.name || "未知",

    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,

    dayMaster: dayStem,
    dayMasterElement,
    fiveElements,
    luckyElement,
    zodiacAnimal,
    zodiacEmoji: ANIMAL_EMOJI[zodiacAnimal] || "🐲",
    westernZodiac: westernZodiac.name,
    westernZodiacSymbol: westernZodiac.symbol,

    tenGods,
    nayin,
    dayMasterStrength,
    dayMasterScore,
    dayMasterDesc: dmDesc.trait,
    dayMasterDescEn: dmDesc.traitEn,
    unluckyElement,
    currentYearStem,
    currentYearBranch,
    currentYearNayin,

    elementColors: ELEMENT_COLORS,
    elementEmoji: ELEMENT_EMOJI,
  };
}

export { CHINESE_HOURS, ELEMENT_COLORS, ELEMENT_EMOJI, STEM_ELEMENTS, BRANCH_ELEMENTS, HEAVENLY_STEMS, EARTHLY_BRANCHES };
