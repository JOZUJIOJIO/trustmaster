"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";
import { getFavorites } from "@/lib/favorites";
import type { Master } from "@/lib/types";
import MasterCard from "@/components/MasterCard";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLocale();
  const [favorites, setFavorites] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    getFavorites(user.id).then((data) => {
      setFavorites(data);
      setLoading(false);
    });
  }, [user, authLoading]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-900">{t("app.name")}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">{t("nav.favorites")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="lg:hidden flex items-center justify-between h-11 px-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <Link href="/" className="text-amber-800 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px]">{t("nav.favorites")}</span>
        </div>
        <LanguageSwitcher />
      </div>

      <main className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-10 pb-24">
        {!user && !authLoading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">❤️</div>
            <p className="text-gray-500 text-sm mb-4">{t("favorites.loginRequired")}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-amber-800 text-white rounded-xl text-sm font-semibold"
            >
              {t("auth.login")}
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-3xl">🔮</div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:overflow-hidden">
            <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3">
              {favorites.map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">❤️</div>
            <p className="text-gray-500 text-sm">{t("favorites.empty")}</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
