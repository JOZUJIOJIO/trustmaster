"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: Review[] | null }) => {
        setMyReviews(data ?? []);
        setLoading(false);
      });
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen">
        <div className="lg:hidden flex items-center h-11 px-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <Link href="/" className="text-amber-800 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px]">{t("nav.profile")}</span>
        </div>
        <div className="text-center py-20">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-gray-500 text-sm mb-4">{t("profile.loginRequired")}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-amber-800 text-white rounded-xl text-sm font-semibold"
          >
            {t("auth.login")}
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

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
            <span className="text-sm text-gray-500">{t("nav.profile")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="lg:hidden flex items-center justify-between h-11 px-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <Link href="/" className="text-amber-800 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px]">{t("nav.profile")}</span>
        </div>
        <LanguageSwitcher />
      </div>

      <main className="lg:max-w-2xl lg:mx-auto lg:px-6 lg:py-10 pb-24">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-3xl">🔮</div>
          </div>
        ) : (
          <div className="space-y-4 p-4 lg:p-0">
            {/* User Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-100 mx-auto flex items-center justify-center text-2xl">
                👤
              </div>
              <h2 className="text-lg font-bold mt-3">
                {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            {/* My Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-3">{t("profile.myReviews")}</h3>
              {myReviews.length > 0 ? (
                <div className="space-y-3">
                  {myReviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <Link href={`/master/${review.master_id}`} className="text-sm font-medium text-amber-800">
                          {review.master_id}
                        </Link>
                        <span className="text-amber-500 text-sm">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-600 mt-1">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t("profile.noReviews")}</p>
              )}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
            >
              {t("auth.logout")}
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
