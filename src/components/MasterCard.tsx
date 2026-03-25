"use client";

import Link from "next/link";
import Image from "next/image";
import type { Master } from "@/lib/types";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedName, getLocalizedList } from "@/lib/i18n";
import FavoriteButton from "@/components/FavoriteButton";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="text-amber-500 text-sm">
      {"★".repeat(full)}
      {half && "★"}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export default function MasterCard({ master }: { master: Master }) {
  const { locale, t } = useLocale();
  const name = getLocalizedName(locale, master.name_th, master.name);
  const specialties = getLocalizedList(locale, master.specialty_th, master.specialty);

  return (
    <Link
      href={`/master/${master.id}`}
      className="flex items-start gap-3 p-4 border-b border-amber-400/10 hover:bg-white/[0.03] transition-colors"
    >
      <div className="w-14 h-14 rounded-full bg-amber-900/20 flex items-center justify-center text-2xl flex-shrink-0 border border-amber-400/20 overflow-hidden">
        {master.avatar_url ? (
          <Image
            src={master.avatar_url}
            alt={name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          master.avatar_emoji
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-amber-100 text-[15px]">{name}</h3>
          {master.verified && (
            <span className="text-[10px] bg-green-900/20 text-green-400/80 px-1.5 py-0.5 rounded-full border border-green-500/20">
              ✓ {t("masters.verified")}
            </span>
          )}
        </div>
        <p className="text-xs text-amber-200/70 mt-0.5">
          {specialties.join(" · ")}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Stars rating={master.rating} />
          <span className="text-xs text-amber-200/40">
            {master.rating} ({master.review_count} {t("masters.reviews")})
          </span>
        </div>
        <p className="text-[11px] text-amber-200/30 mt-0.5">
          {master.experience} {t("masters.experience")}
        </p>
      </div>
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
        <FavoriteButton masterId={master.id} />
        <div className="text-sm font-semibold text-amber-300">
          ฿{master.price_min}
        </div>
        <div className="text-[11px] text-amber-200/30">{t("masters.startFrom")}</div>
      </div>
    </Link>
  );
}
