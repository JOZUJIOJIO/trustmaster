"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";
import { createClient } from "@/lib/supabase/client";
import { getMasters } from "@/lib/db";
import type { Review, Master } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [masterNames, setMasterNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    Promise.all([
      supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }: { data: Review[] | null }) => data ?? []),
      getMasters(),
    ]).then(([reviews, masters]: [Review[], Master[]]) => {
      setMyReviews(reviews);
      const names: Record<string, string> = {};
      masters.forEach((m) => { names[m.id] = m.name_th || m.name; });
      setMasterNames(names);
      setLoading(false);
    });
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#0a0814]">
        <div className="lg:hidden flex items-center h-11 px-4 border-b border-amber-400/10 sticky top-0 bg-[#0a0814] z-10">
          <Link href="/" className="text-amber-200/60 hover:text-amber-200 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px] text-amber-100">{t("nav.profile")}</span>
        </div>
        <div className="text-center py-20">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-amber-200/40 text-sm mb-4">{t("profile.loginRequired")}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white rounded-xl text-sm font-semibold"
          >
            {t("auth.login")}
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

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
            <span className="text-sm text-amber-200/40">{t("nav.profile")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="lg:hidden flex items-center justify-between h-11 px-4 border-b border-amber-400/10 sticky top-0 bg-[#0a0814] z-10">
        <div className="flex items-center">
          <Link href="/" className="text-amber-200/60 hover:text-amber-200 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px] text-amber-100">{t("nav.profile")}</span>
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
            <div className="bg-white/[0.03] rounded-2xl border border-amber-400/10 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-900/20 border-2 border-amber-400/20 mx-auto flex items-center justify-center text-2xl">
                👤
              </div>
              <h2 className="text-lg font-bold mt-3 text-amber-100">
                {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
              </h2>
              <p className="text-sm text-amber-200/40">{user?.email}</p>
            </div>

            {/* My Reviews */}
            <div className="bg-white/[0.03] rounded-2xl border border-amber-400/10 p-6">
              <h3 className="font-semibold text-amber-200/80 mb-3">{t("profile.myReviews")}</h3>
              {myReviews.length > 0 ? (
                <div className="space-y-3">
                  {myReviews.map((review) => (
                    <div key={review.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                      <div className="flex items-center justify-between">
                        <Link href={`/master/${review.master_id}`} className="text-sm font-medium text-amber-300">
                          {masterNames[review.master_id] || review.master_id}
                        </Link>
                        <span className="text-amber-500 text-sm">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="text-[13px] text-amber-200/60 mt-1">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-amber-200/30">{t("profile.noReviews")}</p>
              )}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-white/[0.05] hover:bg-white/[0.08] text-amber-200/70 rounded-xl font-semibold text-sm transition-colors border border-white/5"
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
