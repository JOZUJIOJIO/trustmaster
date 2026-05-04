"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BrandMark from "@/components/BrandMark";
import { PageArtworkBand, PageArtworkBackdrop } from "@/components/PageArtwork";
import { formatStarsPrice } from "@/lib/pricing";
import { isTelegramMiniAppPreviewRuntime } from "@/lib/telegram/environment";

const miniAppRevenuePath = [
  {
    labelZh: "今日洞察",
    labelEn: "Daily insight",
    price: formatStarsPrice("health_report"),
    href: "/daily",
  },
  {
    labelZh: "完整图谱",
    labelEn: "Complete map",
    price: formatStarsPrice("fortune_pro"),
    href: "/fortune",
  },
  {
    labelZh: "Pro 月度",
    labelEn: "Pro monthly",
    price: formatStarsPrice("fortune_master"),
    href: "/fortune",
  },
];

const miniAppBenefitCards = [
  {
    titleZh: "邀请好友",
    titleEn: "Invite friends",
    descZh: "把你的专属入口发给朋友，对方进入后会带上你的邀请标记。",
    descEn: "Share your entry link and bring friends into Kairos with your invite mark.",
  },
  {
    titleZh: "保存报告",
    titleEn: "Saved reports",
    descZh: "解锁后的图谱和每日节奏会进入你的个人空间。",
    descEn: "Unlocked maps and daily rhythm notes live in your personal space.",
  },
  {
    titleZh: "每日提醒",
    titleEn: "Daily reminder",
    descZh: "回到 Telegram 就能继续查看每日节奏和行动提示。",
    descEn: "Return in Telegram to continue your daily rhythm and action prompts.",
  },
];

export default function ProfilePage() {
  const { user, telegramUser, loading: authLoading, signOut } = useAuth();
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
  const [telegramLinkCopied, setTelegramLinkCopied] = useState(false);
  const [isMiniAppPreview, setIsMiniAppPreview] = useState(false);
  const isPreviewTelegramProfile = Boolean(isMiniAppPreview && !telegramUser && !user);
  const isTelegramProfile = Boolean((telegramUser || isPreviewTelegramProfile) && !user);
  const botUsername = (process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "xkairos_bot").replace(/^@/, "");
  const telegramInviteLink = referral.referralCode
    ? `https://t.me/${botUsername}/kairos?startapp=ref_${referral.referralCode}`
    : `https://t.me/${botUsername}/kairos`;
  const profileName = user?.user_metadata?.display_name
    || user?.email?.split("@")[0]
    || telegramUser?.firstName
    || (isPreviewTelegramProfile ? (isChinese ? "Kairos 体验用户" : "Kairos Preview") : "")
    || "Kairos";
  const profileSubtitle = user?.email
    || (telegramUser?.username ? `@${telegramUser.username}` : telegramUser ? `Telegram ID ${telegramUser.telegramUserId}` : isPreviewTelegramProfile ? "Telegram Mini App Preview" : "");

  useEffect(() => {
    if (authLoading) return;
    const isPreview = isTelegramMiniAppPreviewRuntime();
    setIsMiniAppPreview(isPreview);

    if (!user && !telegramUser && isPreview) {
      setSubscription({ subscribed: false });
      setReferral({
        referralCode: "preview",
        freeReadings: 0,
        stats: { signups: 0, converted: 0 },
      });
      setLoading(false);
      return;
    }

    if (!user && !telegramUser) {
      router.replace("/login?redirect=/profile");
      return;
    }

    if (telegramUser && !user) {
      setSubscription({ subscribed: false });
      setReferral({
        referralCode: telegramUser.referralCode || null,
        freeReadings: 0,
        stats: { signups: 0, converted: 0 },
      });
      setLoading(false);
      return;
    }

    if (!user) return;

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
  }, [user, telegramUser, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push(isTelegramProfile ? "/tg" : "/");
  };

  if (!authLoading && !user && !telegramUser && !isMiniAppPreview) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0814]">
        <PageArtworkBackdrop art="profile" />
        <div className="lg:hidden flex items-center h-11 px-4 border-b border-amber-400/10 sticky top-0 bg-[#0a0814] z-10">
          <Link href="/" className="text-amber-200/60 hover:text-amber-200 mr-3 text-lg">←</Link>
          <span className="font-semibold text-[15px] text-amber-100">{t("nav.profile")}</span>
        </div>
        {/* Non-logged-in state */}
        <div className="relative z-10 text-center space-y-6 py-8">
          <div className="mb-2 flex justify-center"><BrandMark size="lg" /></div>
          <h2 className="text-xl font-bold text-amber-100">
            {isChinese ? "解锁你的专属图谱" : "Unlock Your Personal Map"}
          </h2>
          <p className="text-amber-200/50 text-sm max-w-xs mx-auto">
            {isChinese ? "登录后，你可以保存图谱、追踪每日趋势、获得个性化建议" : "Sign in to save your map, track daily trends, and get personalized insights"}
          </p>

          {/* Feature highlights */}
          <div className="space-y-3 max-w-xs mx-auto text-left">
            {[
              { icon: "📊", text: isChinese ? "永久保存你的个人图谱" : "Save your personal map permanently" },
              { icon: "📅", text: isChinese ? "每日个性化趋势追踪" : "Daily personalized trend tracking" },
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
              <BrandMark size="sm" />
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

      <PageArtworkBand art="profile" className="h-36 lg:h-56 border-b border-amber-400/10" />

      <main className="lg:max-w-3xl lg:mx-auto lg:px-6 lg:py-10 pb-24">
        {loading ? (
          <div className="text-center py-20">
            <div className="flex justify-center animate-pulse"><BrandMark size="md" /></div>
          </div>
        ) : (
          <div className="space-y-4 p-4 lg:p-0">
            {/* User Info */}
            <div className="bg-white/[0.03] rounded-2xl border border-amber-400/10 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-900/20 border-2 border-amber-400/20 mx-auto flex items-center justify-center text-2xl">
                👤
              </div>
              <h2 className="text-lg font-bold mt-3 text-amber-100">
                {profileName}
              </h2>
              <p className="text-sm text-amber-200/40">{profileSubtitle}</p>
              {isTelegramProfile && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-cyan-900/25 border border-cyan-400/25 rounded-full">
                  <span className="text-xs">Telegram</span>
                  <span className="text-xs font-semibold text-cyan-200">{isChinese ? "免注册身份" : "Mini App identity"}</span>
                </div>
              )}
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
                  {isTelegramProfile ? (isChinese ? "Telegram Stars 解锁" : "Unlock with Telegram Stars") : (isChinese ? "升级 Pro 会员" : "Upgrade to Pro")}
                </h3>
                <p className="text-sm text-amber-200/40 mb-3">
                  {isTelegramProfile
                    ? (isChinese ? "Mini App 内使用 Stars 单次解锁，支付后自动生成 AI 深度解读" : "Use Stars inside the Mini App to unlock a focused AI reading")
                    : (isChinese ? "无限 AI 洞察 · 每日趋势 · $4.99/月" : "Unlimited AI readings · Daily insights · $4.99/mo")}
                </p>
                <Link
                  href="/fortune"
                  className="inline-block px-5 py-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold"
                >
                  {isChinese ? "了解详情" : "Learn More"}
                </Link>
              </div>
            )}

            {isTelegramProfile && (
              <section className="rounded-2xl border border-emerald-400/15 bg-emerald-300/[0.045] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/58">Stars Wallet</p>
                    <h3 className="mt-1 text-lg font-semibold text-emerald-50">
                      {isChinese ? "我的星星权益" : "My Stars Access"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/58">
                      {isChinese
                        ? "在 Telegram 里，你可以用 Stars 解锁更完整的洞察，也可以把专属入口分享给朋友。"
                        : "Use Stars to unlock deeper insight in Telegram, then share your personal entry with friends."}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-300/20 px-3 py-1 text-[10px] font-semibold text-emerald-100/72">
                    Stars
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {miniAppRevenuePath.map((item) => (
                    <Link
                      key={item.labelEn}
                      href={item.href}
                      className="rounded-xl border border-emerald-300/12 bg-black/20 p-3 text-center transition active:scale-[0.99]"
                    >
                      <span className="block text-[10px] leading-4 text-emerald-50/52">
                        {isChinese ? item.labelZh : item.labelEn}
                      </span>
                      <span className="mt-1 block font-data text-lg font-bold text-emerald-100">{item.price}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-amber-300/14 bg-black/[0.18] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-amber-100/56">
                    {isChinese ? "Telegram 邀请链接" : "Telegram invite link"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="min-w-0 flex-1 truncate rounded-lg border border-amber-300/12 bg-white/[0.04] px-3 py-2 text-xs text-amber-50/66">
                      {telegramInviteLink}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(telegramInviteLink).then(() => {
                          setTelegramLinkCopied(true);
                          setTimeout(() => setTelegramLinkCopied(false), 2000);
                        });
                      }}
                      className="min-h-[36px] rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white transition active:scale-[0.98]"
                    >
                      {telegramLinkCopied ? "OK" : (isChinese ? "复制" : "Copy")}
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {miniAppBenefitCards.map((card) => (
                    <div key={card.titleEn} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-sm font-semibold text-amber-50">
                        {isChinese ? card.titleZh : card.titleEn}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-amber-50/52">
                        {isChinese ? card.descZh : card.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
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
