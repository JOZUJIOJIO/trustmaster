import type { ConstitutionResult, QuizAnswer } from "./types";
import { QUESTIONS } from "./constitution-questions";

const ELEMENTS = ["木", "火", "土", "金", "水"] as const;
const NINE_TYPES = ["平和", "气虚", "阳虚", "阴虚", "痰湿", "湿热", "血瘀", "气郁", "特禀"] as const;

export function calculateConstitution(answers: QuizAnswer[]): ConstitutionResult {
  if (answers.length !== 18) {
    throw new Error(`Expected 18 answers, got ${answers.length}`);
  }

  // --- Five Elements scoring ---
  const rawElements: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const score = answers[i];
    for (const [element, weight] of Object.entries(q.elementWeights)) {
      rawElements[element] += score * weight;
    }
  }

  // Shift all values to positive range, then normalize to percentages
  const minVal = Math.min(...Object.values(rawElements));
  const shifted: Record<string, number> = {};
  for (const el of ELEMENTS) {
    shifted[el] = rawElements[el] - minVal + 1;
  }
  const total = Object.values(shifted).reduce((a, b) => a + b, 0);
  const fiveElements = {} as Record<string, number>;
  for (const el of ELEMENTS) {
    fiveElements[el] = Math.round((shifted[el] / total) * 100);
  }
  // Fix rounding so sum === 100
  const roundSum = Object.values(fiveElements).reduce((a, b) => a + b, 0);
  if (roundSum !== 100) {
    const maxEl = ELEMENTS.reduce((a, b) => (fiveElements[a] >= fiveElements[b] ? a : b));
    fiveElements[maxEl] += 100 - roundSum;
  }

  const elementType = ELEMENTS.reduce((a, b) => (fiveElements[a] >= fiveElements[b] ? a : b));

  // --- Nine Constitutions scoring ---
  const rawNine: Record<string, number> = {};
  for (const t of NINE_TYPES) rawNine[t] = 0;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const score = answers[i];
    for (const [cType, weight] of Object.entries(q.constitutionWeights)) {
      rawNine[cType] += score * weight;
    }
  }

  // Find max possible score per constitution for normalization
  const maxPossible: Record<string, number> = {};
  for (const t of NINE_TYPES) {
    let max = 0;
    for (const q of QUESTIONS) {
      const w = q.constitutionWeights[t];
      if (w && w > 0) max += 5 * w;
    }
    maxPossible[t] = max || 1;
  }

  const nineScores: Record<string, number> = {};
  for (const t of NINE_TYPES) {
    nineScores[t] = Math.round(Math.min(100, (rawNine[t] / maxPossible[t]) * 100));
  }

  // Determine primary type
  const sortedTypes = [...NINE_TYPES]
    .filter((t) => t !== "平和")
    .sort((a, b) => nineScores[b] - nineScores[a]);

  let constitutionType: string;
  let secondaryType: string | null = null;

  const topScore = nineScores[sortedTypes[0]];
  if (topScore < 30) {
    constitutionType = "平和";
    nineScores["平和"] = 100 - topScore;
  } else {
    constitutionType = sortedTypes[0];
    const secondScore = nineScores[sortedTypes[1]];
    if (secondScore >= topScore * 0.6) {
      secondaryType = sortedTypes[1];
    }
  }

  return {
    elementType,
    constitutionType,
    secondaryType,
    fiveElements: fiveElements as ConstitutionResult["fiveElements"],
    nineScores,
  };
}
