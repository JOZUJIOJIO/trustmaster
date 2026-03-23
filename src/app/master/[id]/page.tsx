"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMasterById, getReviewsByMasterId } from "@/lib/db";
import type { Master, Review } from "@/lib/types";
import { useLocale } from "@/lib/LocaleContext";
import { getLocalizedName, getLocalizedList, getLocalizedText } from "@/lib/i18n";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import FavoriteButton from "@/components/FavoriteButton";
import ReviewForm from "@/components/ReviewForm";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="text-amber-500">
      {"★".repeat(full)}
      {half && "★"}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

function TimeAgo({ dateStr, t }: { dateStr: string; t: (key: string) => string }) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  let text: string;
  if (days < 7) text = `${days} ${t("time.daysAgo")}`;
  else if (days < 30) text = `${Math.floor(days / 7)} ${t("time.weeksAgo")}`;
  else text = `${Math.floor(days / 30)} ${t("time.monthsAgo")}`;
  return <span>{text}</span>;
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto" />
        <div className="h-5 bg-gray-200 rounded w-40 mx-auto mt-3" />
        <div className="h-3 bg-gray-200 rounded w-32 mx-auto mt-2" />
      </div>
      <div className="px-4 py-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function MasterProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { locale, t } = useLocale();
  const [master, setMaster] = useState<Master | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMasterById(id), getReviewsByMasterId(id)]).then(
      ([masterData, reviewsData]) => {
        if (!cancelled) {
          setMaster(masterData);
          setReviews(reviewsData);
          setLoading(false);
        }
      }
    );
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="lg:hidden flex items-center h-11 px-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <Link href="/" className="text-amber-800 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px]">{t("detail.profile")}</span>
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  if (!master) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Master not found
      </div>
    );
  }

  const name = getLocalizedName(locale, master.name_th, master.name);
  const specialties = getLocalizedList(locale, master.specialty_th, master.specialty);
  const description = getLocalizedText(locale, master.description_th, master.description);
  const location = getLocalizedText(locale, master.location_th, master.location);
  const hasLineId = master.line_id && master.line_id.trim() !== "";
  const lineUrl = hasLineId ? `https://line.me/R/ti/p/${encodeURIComponent(master.line_id)}` : "#";

  return (
    <div className="min-h-screen">
      {/* ===== PC Header ===== */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-900">{t("app.name")}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">{t("detail.profile")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* ===== Mobile Header ===== */}
      <div className="lg:hidden flex items-center justify-between h-11 px-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <Link href="/" className="text-amber-800 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px]">{t("detail.profile")}</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* ===== Main Content ===== */}
      <main className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-10 pb-24 lg:pb-0">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:overflow-hidden lg:sticky lg:top-24">
              {/* Profile Header */}
              <div className="text-center py-6 bg-gradient-to-b from-amber-50/80 to-white lg:px-6">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-amber-50 border-2 border-amber-100 mx-auto flex items-center justify-center text-4xl lg:text-5xl overflow-hidden">
                  {master.avatar_url ? (
                    <Image
                      src={master.avatar_url}
                      alt={name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    master.avatar_emoji
                  )}
                </div>
                <h1 className="text-lg lg:text-xl font-bold mt-3">{name}</h1>
                {locale !== "th" && (
                  <p className="text-sm text-gray-500">{master.name_th}</p>
                )}
                {locale === "th" && (
                  <p className="text-sm text-gray-500">{master.name}</p>
                )}
                <p className="text-xs text-amber-700 mt-1">
                  {specialties.join(" · ")}
                </p>
                {master.verified && (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-[11px] rounded-full border border-green-200">
                    ✓ {t("detail.verifiedMaster")}
                  </span>
                )}
                <div className="mt-2">
                  <FavoriteButton masterId={master.id} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 px-4 py-4 lg:px-6">
                {[
                  { value: master.review_count, label: t("detail.reviewCount") },
                  { value: master.rating, label: t("detail.rating") },
                  { value: `${master.experience}${locale === "th" ? " ปี" : "yr"}`, label: t("detail.experienceYears") },
                  { value: `${master.satisfaction_score}%`, label: t("detail.satisfaction") },
                ].map((stat) => (
                  <div key={stat.label} className="bg-amber-50/50 rounded-xl p-3 text-center border border-amber-100/50">
                    <div className="text-lg font-bold text-amber-800">{stat.value}</div>
                    <div className="text-[11px] text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Book CTA - PC */}
              {hasLineId && (
                <div className="hidden lg:block px-6 pb-6">
                  <a
                    href={lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-amber-800 hover:bg-amber-900 text-white text-center py-3.5 rounded-xl font-semibold text-[15px] transition-colors shadow-lg shadow-amber-800/20"
                  >
                    💬 {t("detail.bookLine")} · {t("detail.from")} ฿{master.price_min}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-0 lg:space-y-6">
            {/* About */}
            <div className="px-4 py-4 border-b border-gray-100 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-gray-800 mb-2">{t("detail.about")}</h2>
              <p className="text-[13px] lg:text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[11px] lg:text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  📍 {location}
                </span>
                <span className="text-[11px] lg:text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  🕐 {master.availability}
                </span>
                {master.languages.map((lang) => (
                  <span
                    key={lang}
                    className="text-[11px] lg:text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    🌐 {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Info */}
            <div className="px-4 py-4 border-b border-gray-100 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-gray-800 mb-2">{t("detail.pricing")}</h2>
              <div className="flex items-center justify-between bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {t("detail.onlineConsult")}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {t("detail.viaLine")} · {t("detail.duration")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base lg:text-lg font-bold text-amber-800">
                    ฿{master.price_min} - ฿{master.price_max}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="px-4 py-4 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-gray-800 mb-3">
                {t("detail.userReviews")} ({reviews.length})
              </h2>
              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="mb-4 pb-4 border-b border-gray-50 lg:mb-0 lg:pb-0 lg:border-b-0 lg:bg-gray-50 lg:rounded-xl lg:p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gray-700">
                        {review.user_name}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        <TimeAgo dateStr={review.created_at} t={t} />
                      </span>
                    </div>
                    <div className="text-xs mt-0.5">
                      <Stars rating={review.rating} />
                    </div>
                    <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed">
                      {getLocalizedText(locale, review.comment_th, review.comment)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Review Form */}
              <div className="mt-4">
                <ReviewForm
                  masterId={master.id}
                  onSubmitted={() => {
                    getReviewsByMasterId(id).then(setReviews);
                    getMasterById(id).then((m) => { if (m) setMaster(m); });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile CTA */}
      {hasLineId && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 pb-2 z-10 lg:hidden">
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-amber-800 hover:bg-amber-900 text-white text-center py-3.5 rounded-xl font-semibold text-[15px] transition-colors shadow-lg shadow-amber-800/20"
          >
            💬 {t("detail.bookLine")} · {t("detail.from")} ฿{master.price_min}
          </a>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
