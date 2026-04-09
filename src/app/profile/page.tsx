"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isChinese, t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    plan?: string;
    expiresAt?: string;
    cancelAtPeriodEnd?: boolean;
  }>({ subscribed: false });
  const [referral, setReferral] = useState<{
    referralCode: string | null;
    freeReadings: number;
    stats: { signups: number; converted: number };
  }>({ referralCode: null, freeReadings: 0, stats: { signups: 0, converted: 0 } });
  const [refCopied, setRefCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/profile");
      return;
    }

    Promise.all([
      fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }).then((r) => r.json()).catch(() => ({ subscribed: false })),
      fetch(`/api/referral?userId=${user.id}`)
        .then((r) => r.json())
        .catch(() => ({ referralCode: null, freeReadings: 0, stats: { signups: 0, converted: 0 } })),
    ]).then(([sub, ref]) => {
      setSubscription(sub);
      setReferral(ref);
      if (ref.referralCode) {
        try { localStorage.setItem("kairos_ref_code", ref.referralCode); } catch {}
      }
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
        {/* Non-logged-in state */}
        <div className="text-center space-y-6 py-8">
          <div className="text-5xl mb-2">🔮</div>
          <h2 className="text-xl font-bold text-amber-100">
            {isChinese ? "解锁你的专属命盘" : "Unlock Your Personal Chart"}
          </h2>
          <p className="text-amber-200/50 text-sm max-w-xs mx-auto">
            {isChinese ? "登录后，你可以保存命盘、追踪每日运势、获得个性化建议" : "Sign in to save your chart, track daily fortune, and get personalized insights"}
          </p>

          {/* Feature highlights */}
          <div className="space-y-3 max-w-xs mx-auto text-left">
            {[
              { icon: "📊", text: isChinese ? "永久保存你的八字命盘" : "Save your BaZi chart permanently" },
              { icon: "📅", text: isChinese ? "每日个性化运势追踪" : "Daily personalized fortune tracking" },
              { icon: "🎁", text: isChinese ? "注册即送一次免费 AI 深度解读" : "Free AI deep reading on signup" },
              { icon: "💑", text: isChinese ? "保存合盘分析记录" : "Save compatibility analysis records" },
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
          <p className="text-amber-200/20 text-[10px]">
            {isChinese ? "支持 Google 一键登录" : "Google one-click sign in available"}
          </p>
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

      <main className="lg:max-w-3xl lg:mx-auto lg:px-6 lg:py-10 pb-24">
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
              {subscription.subscribed && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-900/30 border border-emerald-500/30 rounded-full">
                  <span className="text-xs">♾️</span>
                  <span className="text-xs font-semibold text-emerald-300">Pro {subscription.plan === "yearly" ? (isChinese ? "年度" : "Yearly") : (isChinese ? "月度" : "Monthly")}</span>
                </div>
              )}
            </div>

            {/* Subscription Status */}
            {subscription.subscribed ? (
              <div className="bg-emerald-900/10 rounded-2xl border border-emerald-400/15 p-5">
                <h3 className="font-semibold text-emerald-200/80 mb-2">
                  {isChinese ? "Pro 会员" : "Pro Membership"}
                </h3>
                <div className="space-y-1.5 text-sm text-emerald-200/50">
                  <p>{isChinese ? "无限 AI 深度解读" : "Unlimited AI deep readings"}</p>
                  {subscription.expiresAt && (
                    <p>{isChinese ? "续费日期：" : "Renews: "}{new Date(subscription.expiresAt).toLocaleDateString()}</p>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-amber-400/70">{isChinese ? "将在当前周期结束后取消" : "Cancels at end of period"}</p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/subscription/portal", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user?.id }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-emerald-400/15 rounded-lg text-xs text-emerald-200/70 font-medium transition-colors cursor-pointer"
                >
                  {isChinese ? "管理订阅" : "Manage Subscription"}
                </button>
              </div>
            ) : (
              <div className="bg-white/[0.03] rounded-2xl border border-amber-400/10 p-5">
                <h3 className="font-semibold text-amber-200/80 mb-2">
                  {isChinese ? "升级 Pro 会员" : "Upgrade to Pro"}
                </h3>
                <p className="text-sm text-amber-200/40 mb-3">
                  {isChinese ? "无限 AI 解读 · 每日深度运势 · $4.99/月" : "Unlimited AI readings · Daily insights · $4.99/mo"}
                </p>
                <Link
                  href="/fortune"
                  className="inline-block px-5 py-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold"
                >
                  {isChinese ? "了解详情" : "Learn More"}
                </Link>
              </div>
            )}

            {/* Referral Program */}
            {referral.referralCode && (
              <div className="bg-white/[0.03] rounded-2xl border border-amber-400/10 p-5">
                <h3 className="font-semibold text-amber-200/80 mb-3">
                  {isChinese ? "🎁 邀请有礼" : "🎁 Invite & Earn"}
                </h3>
                <p className="text-xs text-amber-200/40 mb-3">
                  {isChinese
                    ? "邀请好友注册并付费，你将获得免费 AI 解读次数"
                    : "Invite friends to sign up and pay — earn free AI readings"}
                </p>

                {/* Referral link */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-white/5 border border-amber-400/15 rounded-lg px-3 py-2 text-xs text-amber-200/60 truncate">
                    {typeof window !== "undefined" ? `${window.location.origin}/fortune?ref=${referral.referralCode}` : `kairos.app/fortune?ref=${referral.referralCode}`}
                  </div>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/fortune?ref=${referral.referralCode}`;
                      navigator.clipboard.writeText(link).then(() => {
                        setRefCopied(true);
                        setTimeout(() => setRefCopied(false), 2000);
                      });
                    }}
                    className="px-3 py-2 bg-amber-700/50 hover:bg-amber-600/50 text-amber-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {refCopied ? "✓" : (isChinese ? "复制" : "Copy")}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5">
                    <div className="text-lg font-bold text-amber-300">{referral.stats.signups}</div>
                    <div className="text-[10px] text-amber-200/30">{isChinese ? "邀请注册" : "Signups"}</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5">
                    <div className="text-lg font-bold text-emerald-300">{referral.stats.converted}</div>
                    <div className="text-[10px] text-amber-200/30">{isChinese ? "付费转化" : "Converted"}</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5">
                    <div className="text-lg font-bold text-purple-300">{referral.freeReadings}</div>
                    <div className="text-[10px] text-amber-200/30">{isChinese ? "免费次数" : "Free reads"}</div>
                  </div>
                </div>
              </div>
            )}

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
