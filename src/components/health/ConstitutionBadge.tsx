const ELEMENT_CONFIG: Record<string, { emoji: string; color: string; bgClass: string }> = {
  "木": { emoji: "🌿", color: "#22c55e", bgClass: "bg-green-500/10 border-green-500/20" },
  "火": { emoji: "🔥", color: "#ef4444", bgClass: "bg-red-500/10 border-red-500/20" },
  "土": { emoji: "🏔️", color: "#eab308", bgClass: "bg-yellow-500/10 border-yellow-500/20" },
  "金": { emoji: "⚔️", color: "#94a3b8", bgClass: "bg-slate-400/10 border-slate-400/20" },
  "水": { emoji: "💧", color: "#3b82f6", bgClass: "bg-blue-500/10 border-blue-500/20" },
};

const ELEMENT_EN: Record<string, string> = {
  "木": "Wood", "火": "Fire", "土": "Earth", "金": "Metal", "水": "Water",
};

const CONSTITUTION_EN: Record<string, string> = {
  "平和": "Balanced", "气虚": "Qi Deficiency", "阳虚": "Yang Deficiency",
  "阴虚": "Yin Deficiency", "痰湿": "Phlegm-Damp", "湿热": "Damp-Heat",
  "血瘀": "Blood Stasis", "气郁": "Qi Stagnation", "特禀": "Allergic",
};

interface ConstitutionBadgeProps {
  elementType: string;
  constitutionType: string;
  secondaryType?: string | null;
  isChinese?: boolean;
}

export default function ConstitutionBadge({
  elementType, constitutionType, secondaryType, isChinese = false,
}: ConstitutionBadgeProps) {
  const config = ELEMENT_CONFIG[elementType] ?? ELEMENT_CONFIG["土"];

  return (
    <div className="text-center">
      <div className="text-5xl mb-3">{config.emoji}</div>
      <div className="text-[10px] tracking-[0.3em] text-amber-200/30 uppercase mb-2">
        {isChinese ? "你的体质类型" : "Your Constitution Type"}
      </div>
      <div className="text-2xl font-bold text-amber-100 mb-1">
        {elementType}型 · {constitutionType}
      </div>
      <div className="text-sm text-amber-200/50">
        {ELEMENT_EN[elementType]} Type · {CONSTITUTION_EN[constitutionType]}
      </div>
      {secondaryType && (
        <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs border ${config.bgClass}`}>
          {isChinese ? "兼夹" : "Secondary"}: {secondaryType} ({CONSTITUTION_EN[secondaryType]})
        </div>
      )}
    </div>
  );
}
