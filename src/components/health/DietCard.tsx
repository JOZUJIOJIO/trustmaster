import { useLocale } from "@/lib/LocaleContext";
import type { HealthReading } from "@/lib/types";

interface DietCardProps {
  diet: HealthReading["dietTherapy"];
}

export default function DietCard({ diet }: DietCardProps) {
  const { t } = useLocale();

  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-100 mb-4">
        🥗 {t("health.report.diet")}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/[0.06] rounded-xl p-4">
          <div className="text-green-400 font-semibold text-xs mb-3">
            ✓ {t("health.report.dietRecommend")}
          </div>
          <div className="space-y-1.5">
            {diet.recommended.map((item) => (
              <div key={item.name} className="text-xs text-amber-200/50">
                {item.name} <span className="text-amber-200/30">{item.nameLocal}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-500/[0.06] rounded-xl p-4">
          <div className="text-red-400 font-semibold text-xs mb-3">
            ✗ {t("health.report.dietAvoid")}
          </div>
          <div className="space-y-1.5">
            {diet.avoid.map((item) => (
              <div key={item.name} className="text-xs text-amber-200/50">
                {item.name} <span className="text-amber-200/30">{item.nameLocal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
