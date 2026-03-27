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
  const { isChinese, t } = useLocale();
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
    <div className="min-h-screen bg-[#0a0814]">
      {/* Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-[#0a0814]/80 backdrop-blur-md border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-200">{t("app.name")}</span>
            </Link>
            <span className="text-amber-200/20">/</span>
            <span className="text-sm text-amber-200/40">{t("nav.favorites")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="lg:hidden flex items-center justify-between h-11 px-4 border-b border-amber-400/10 sticky top-0 bg-[#0a0814] z-10">
        <div className="flex items-center">
          <Link href="/" className="text-amber-200/60 hover:text-amber-200 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px] text-amber-100">{t("nav.favorites")}</span>
        </div>
        <LanguageSwitcher />
      </div>

      <main className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-10 pb-24">
        {!user && !authLoading ? (
          <div className="text-center space-y-6 py-8">
            <div className="text-5xl mb-2">⭐</div>
            <h2 className="text-xl font-bold text-amber-100">
              {isChinese ? "收藏你信任的大师" : "Save Masters You Trust"}
            </h2>
            <p className="text-amber-200/50 text-sm max-w-xs mx-auto">
              {isChinese ? "登录后，一键收藏大师、随时查看、快速预约咨询" : "Sign in to bookmark masters, review anytime, and book consultations"}
            </p>

            <div className="space-y-3 max-w-xs mx-auto text-left">
              {[
                { icon: "❤️", text: isChinese ? "一键收藏感兴趣的大师" : "Bookmark masters with one tap" },
                { icon: "🔔", text: isChinese ? "大师有新动态时收到提醒" : "Get notified of master updates" },
                { icon: "📋", text: isChinese ? "管理你的咨询记录" : "Manage your consultation history" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-amber-200/60 text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            <a
              href="/login"
              className="inline-block px-8 py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all"
            >
              {isChinese ? "登录 / 注册" : "Log In / Sign Up"}
            </a>

            {/* Quick link to browse masters */}
            <div>
              <a href="/" className="text-amber-400/50 text-xs hover:text-amber-400/80 transition-colors">
                {isChinese ? "先去浏览大师 →" : "Browse masters first →"}
              </a>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-3xl">🔮</div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="lg:bg-white/[0.03] lg:rounded-2xl lg:border lg:border-amber-400/10 lg:overflow-hidden">
            <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3">
              {favorites.map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">❤️</div>
            <p className="text-amber-200/40 text-sm">{t("favorites.empty")}</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
