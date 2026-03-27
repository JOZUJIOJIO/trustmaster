export interface StrengthGaugeProps {
  score: number;
  label: string;
  color: string;
}

export function StrengthGauge({ score, label, color }: StrengthGaugeProps) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" className="transform -rotate-90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="45" cy="45" r={r} fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 90, height: 90 }}>
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-amber-200/30">/100</span>
      </div>
      <span className="text-xs text-amber-200/50 mt-1">{label}</span>
    </div>
  );
}
