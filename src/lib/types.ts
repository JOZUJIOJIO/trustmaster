export interface Profile {
  id: string;
  display_name: string | null;
  preferred_locale: string | null;
}

export interface ConstitutionResult {
  /** Primary five-element type: 木 | 火 | 土 | 金 | 水 */
  elementType: string;
  /** Primary nine-constitution type: 平和 | 气虚 | 阳虚 | 阴虚 | 痰湿 | 湿热 | 血瘀 | 气郁 | 特禀 */
  constitutionType: string;
  /** Secondary constitution (if score > 60% of primary) */
  secondaryType: string | null;
  /** Five element percentages — always sums to 100 */
  fiveElements: { 木: number; 火: number; 土: number; 金: number; 水: number };
  /** Nine constitution scores — each 0-100 */
  nineScores: Record<string, number>;
}

export interface HealthAssessment {
  id: string;
  user_id: string;
  answers: number[];
  constitution_type: string;
  constitution_subtype: string;
  secondary_type: string | null;
  five_elements_score: { 木: number; 火: number; 土: number; 金: number; 水: number };
  nine_constitutions_score: Record<string, number>;
  bazi_chart_hash: string | null;
  created_at: string;
}

export interface HealthReading {
  organHealth: { organ: string; element: string; status: "strong" | "balanced" | "weak" | "excess"; description: string }[];
  dietTherapy: { recommended: { name: string; nameLocal: string }[]; avoid: { name: string; nameLocal: string }[] };
  seasonalWellness: { season: string; advice: string }[];
  lifestyle: string;
  warnings: string[];
  summary: string;
}

export type QuizAnswer = 1 | 2 | 3 | 4 | 5;
