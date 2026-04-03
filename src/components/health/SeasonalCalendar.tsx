import { useLocale } from "@/lib/LocaleContext";
import type { HealthReading } from "@/lib/types";

const SEASON_CONFIG = [
  { key: "spring", emoji: "🌱", color: "bg-green-500/[0.06]", textColor: "text-green-400" },
  { key: "summer", emoji: "☀️", color: "bg-red-500/[0.06]", textColor: "text-red-400" },
  { key: "autumn", emoji: "🍂", color: "bg-yellow-500/[0.06]", textColor: "text-yellow-400" },
  { key: "winter", emoji: "❄️", color: "bg-blue-500/[0.06]", textColor: "text-blue-400" },
];

interface SeasonalCalendarProps {
  seasons: HealthReading["seasonalWellness"];
}

export default function SeasonalCalendar({ seasons }: SeasonalCalendarProps) {
  const { t } = useLocale();

  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-100 mb-4">
        📅 {t("health.report.seasonal")}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {SEASON_CONFIG.map((cfg, i) => (
          <div key={cfg.key} className={`${cfg.color} rounded-xl p-3`}>
            <div className={`font-semibold text-xs ${cfg.textColor}`}>
              {cfg.emoji} {t(`health.${cfg.key}`)}
            </div>
            <div className="text-[11px] text-amber-200/40 mt-2 leading-relaxed">
              {seasons[i]?.advice ?? ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
