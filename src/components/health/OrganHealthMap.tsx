import { useLocale } from "@/lib/LocaleContext";
import type { HealthReading } from "@/lib/types";

const STATUS_CONFIG = {
  strong: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: "✓" },
  balanced: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: "✓" },
  weak: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: "⚠" },
  excess: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: "⚠" },
};

const ORGAN_ICONS: Record<string, string> = {
  "心": "❤️", "肝": "🫁", "脾": "🟤", "肺": "🫁", "肾": "💧",
};

interface OrganHealthMapProps {
  organs: HealthReading["organHealth"];
}

export default function OrganHealthMap({ organs }: OrganHealthMapProps) {
  const { t } = useLocale();

  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-100 mb-4">
        🫀 {t("health.report.organs")}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {organs.map((organ, i) => {
          const cfg = STATUS_CONFIG[organ.status];
          const isLast = i === organs.length - 1 && organs.length % 2 === 1;
          return (
            <div
              key={organ.organ}
              className={`${cfg.bg} border rounded-xl p-3 ${isLast ? "col-span-2" : ""}`}
            >
              <div className="text-sm text-amber-100">
                {ORGAN_ICONS[organ.organ.charAt(0)] ?? "🔵"} {organ.organ}
              </div>
              <div className={`text-xs font-semibold mt-1 ${cfg.color}`}>
                {cfg.icon} {t(`health.status.${organ.status}`)}
              </div>
              <div className="text-[11px] text-amber-200/35 mt-1">{organ.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
