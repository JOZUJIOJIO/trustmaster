"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { filterMasters } from "@/lib/db";
import type { Master } from "@/lib/types";
import MasterCard from "@/components/MasterCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function MasterCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-gray-100 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-40" />
      </div>
      <div className="space-y-1">
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-3 bg-gray-200 rounded w-8" />
      </div>
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);
  const { t } = useLocale();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    filterMasters(category, search).then((data) => {
      if (!cancelled) {
        setMasters(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [category, search]);

  const totalReviews = masters.reduce((sum, m) => sum + m.review_count, 0);
  const avgSatisfaction = masters.length
    ? Math.round(masters.reduce((sum, m) => sum + m.satisfaction_score, 0) / masters.length)
    : 0;

  // ===== Full-screen Hero Landing =====
  if (showHero) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-buddha.jpg')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Top nav */}
          <nav className="flex items-center justify-between px-6 lg:px-12 py-5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl drop-shadow-lg">🔮</span>
              <span className="text-xl font-bold text-amber-100/90 tracking-widest uppercase drop-shadow-lg">
                TrustMaster
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href="/fortune"
                className="hidden sm:flex items-center gap-1.5 text-sm text-amber-200/60 hover:text-amber-200 transition-colors"
              >
                ✨ {t("nav.fortune")}
              </Link>
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Main content - centered */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-px bg-amber-400/40" />
              <span className="text-amber-400/60 text-xs tracking-[0.3em] uppercase">
                ☸ Spiritual Guidance ☸
              </span>
              <div className="w-12 h-px bg-amber-400/40" />
            </div>

            {/* Title */}
            <h1 className="text-gradient-gold text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.15]">
              {t("hero.title")}
            </h1>

            <p className="mt-6 text-amber-100/50 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-8 lg:gap-12 mt-12">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-amber-300 drop-shadow-lg">
                  {masters.length || 6}
                </div>
                <div className="text-[10px] lg:text-xs text-amber-200/40 mt-1 tracking-wider uppercase">
                  {t("stats.masters")}
                </div>
              </div>
              <div className="w-px h-10 bg-amber-400/15" />
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-amber-300 drop-shadow-lg">
                  {totalReviews || 1049}
                </div>
                <div className="text-[10px] lg:text-xs text-amber-200/40 mt-1 tracking-wider uppercase">
                  {t("stats.reviews")}
                </div>
              </div>
              <div className="w-px h-10 bg-amber-400/15" />
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-amber-300 drop-shadow-lg">
                  {avgSatisfaction || 89}%
                </div>
                <div className="text-[10px] lg:text-xs text-amber-200/40 mt-1 tracking-wider uppercase">
                  {t("stats.satisfaction")}
                </div>
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={() => setShowHero(false)}
              className="mt-14 group px-10 py-4 rounded-full font-semibold text-base lg:text-lg cursor-pointer
                         bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700
                         text-white border border-amber-500/30
                         shadow-[0_0_40px_rgba(217,119,6,0.2)] hover:shadow-[0_0_60px_rgba(217,119,6,0.35)]
                         hover:scale-105 transition-all duration-500"
            >
              {t("hero.cta")} →
            </button>

            {/* Bottom decorative elements */}
            <div className="mt-16 flex items-center gap-4 text-amber-400/20 text-lg">
              <span>☯</span>
              <span>✦</span>
              <span>🪷</span>
              <span>✦</span>
              <span>☸</span>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="text-center pb-6 lg:pb-8">
            <p className="text-[10px] text-amber-200/20 tracking-wider">
              {t("disclaimer.text")}
            </p>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden relative z-10">
          <BottomNav />
        </div>
      </div>
    );
  }

  // ===== Main app view (after CTA click) =====
  return (
    <div className="min-h-screen">
      {/* PC Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHero(true)} className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-900">{t("app.name")}</span>
            </button>
          </div>
          <nav className="flex items-center gap-8 text-sm text-gray-600">
            <span className="text-amber-800 font-medium cursor-default">{t("nav.home")}</span>
            <a href="/fortune" className="hover:text-amber-700 transition-colors">✨ {t("nav.fortune")}</a>
            <a href="/favorites" className="hover:text-amber-700 transition-colors">{t("nav.favorites")}</a>
            <a href="/profile" className="hover:text-amber-700 transition-colors">{t("nav.profile")}</a>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-b from-amber-50 to-white px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowHero(true)} className="cursor-pointer">
            <h1 className="text-xl font-bold text-amber-900">{t("app.name")}</h1>
            <p className="text-xs text-amber-700 mt-0.5">{t("app.tagline")}</p>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main id="masters" className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-10">
        <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:overflow-hidden">
          <div className="lg:flex lg:items-center lg:gap-4 lg:p-6 lg:border-b lg:border-gray-100">
            <div className="lg:flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800 px-4 py-3 lg:px-6 lg:text-base">
              {t("masters.popular")}
            </h2>

            {loading ? (
              <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MasterCardSkeleton key={i} />
                ))}
              </div>
            ) : masters.length > 0 ? (
              <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3">
                {masters.map((master) => (
                  <MasterCard key={master.id} master={master} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                {t("masters.notFound")}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PC Footer */}
      <footer className="hidden lg:block bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔮</span>
                <span className="text-lg font-bold text-white">{t("app.name")}</span>
              </div>
              <p className="text-sm leading-relaxed">{t("footer.desc")}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">{t("footer.links")}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">{t("footer.contact")}</h4>
              <p className="text-sm">support@trustmaster.app</p>
              <p className="text-sm mt-1">Bangkok, Thailand</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
            © 2026 TrustMaster. {t("footer.copyright")}.
          </div>
        </div>
      </footer>

      <div className="pb-20 lg:pb-0">
        <BottomNav />
      </div>
    </div>
  );
}
