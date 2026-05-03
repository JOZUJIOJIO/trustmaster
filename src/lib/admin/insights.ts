import type { Database } from "@/lib/supabase/database.types";

type Tables = Database["public"]["Tables"];
type Profile = Tables["profiles"]["Row"];
type Order = Tables["orders"]["Row"];
type Subscription = Tables["subscriptions"]["Row"];
type HealthAssessment = Tables["health_assessments"]["Row"];
type HealthConversation = Tables["health_conversations"]["Row"];
type Referral = Tables["referrals"]["Row"];
type Reading = Tables["readings_cache"]["Row"];
type Horoscope = Tables["horoscope_cache"]["Row"];
type TelegramAccount = Tables["telegram_accounts"]["Row"];
type TelegramEvent = Tables["telegram_events"]["Row"];

export type AdminKpi = {
  label: string;
  value: string;
  hint: string;
  tone: "amber" | "emerald" | "rose" | "cyan";
  href: string;
};

export type AdminActionItem = {
  title: string;
  detail: string;
  href: string;
  priority: "high" | "medium" | "low";
};

export type AdminInsightInput = {
  now?: Date;
  totals?: Partial<{
    profiles: number;
    orders: number;
    subscriptions: number;
    healthAssessments: number;
    referrals: number;
    readings: number;
    horoscope: number;
    telegramAccounts: number;
  }>;
  profiles: Profile[];
  orders: Order[];
  subscriptions: Subscription[];
  healthAssessments: HealthAssessment[];
  healthConversations: HealthConversation[];
  referrals: Referral[];
  readings: Reading[];
  horoscope: Horoscope[];
  telegramAccounts: TelegramAccount[];
  telegramEvents: TelegramEvent[];
};

export type AdminInsights = {
  kpis: {
    users: AdminKpi;
    revenueUsd: AdminKpi;
    starsRevenue: AdminKpi;
    activeSubscriptions: AdminKpi;
    healthAssessments: AdminKpi;
    telegramUsers: AdminKpi;
    referrals: AdminKpi;
    contentCache: AdminKpi;
  };
  today: {
    users: number;
    orders: number;
    revenueUsd: number;
    healthAssessments: number;
    telegramEvents: number;
  };
  risks: {
    failedOrders: number;
    cancelingSubscriptions: number;
    pendingRewards: number;
    staleTelegramAccounts: number;
  };
  funnel: {
    profiles: number;
    paidOrders: number;
    activeSubscriptions: number;
    healthAssessments: number;
    conversionRate: number;
  };
  channels: { label: string; value: number; tone: string }[];
  plans: { label: string; value: number }[];
  actionItems: AdminActionItem[];
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isToday(value: string | null | undefined, dayStart: Date) {
  if (!value) return false;
  return new Date(value).getTime() >= dayStart.getTime();
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function countBy<T>(rows: T[], getKey: (row: T) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = getKey(row) || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildAdminInsights(input: AdminInsightInput): AdminInsights {
  const now = input.now || new Date();
  const dayStart = startOfDay(now);
  const totalProfiles = input.totals?.profiles ?? input.profiles.length;
  const totalSubscriptions = input.totals?.subscriptions ?? input.subscriptions.length;
  const totalHealthAssessments = input.totals?.healthAssessments ?? input.healthAssessments.length;
  const totalReferrals = input.totals?.referrals ?? input.referrals.length;
  const totalReadings = input.totals?.readings ?? input.readings.length;
  const totalHoroscope = input.totals?.horoscope ?? input.horoscope.length;
  const totalTelegramAccounts = input.totals?.telegramAccounts ?? input.telegramAccounts.length;
  const paidOrders = input.orders.filter((order) => order.status === "paid");
  const paidUsd = paidOrders
    .filter((order) => order.currency.toUpperCase() !== "XTR")
    .reduce((sum, order) => sum + (order.amount || 0), 0) / 100;
  const paidStars = paidOrders
    .filter((order) => order.currency.toUpperCase() === "XTR")
    .reduce((sum, order) => sum + (order.amount || 0), 0);
  const activeSubscriptions = input.subscriptions.filter((sub) => ["active", "trialing"].includes(sub.status));
  const failedOrders = input.orders.filter((order) => ["failed", "expired", "canceled"].includes(order.status)).length;
  const cancelingSubscriptions = activeSubscriptions.filter((sub) => sub.cancel_at_period_end).length;
  const pendingRewards = input.referrals.filter((referral) => referral.status === "converted" && !referral.reward_given).length;
  const staleTelegramAccounts = input.telegramAccounts.filter((account) => {
    const lastSeen = new Date(account.last_seen_at).getTime();
    return Number.isFinite(lastSeen) && now.getTime() - lastSeen > 7 * 24 * 60 * 60 * 1000;
  }).length;
  const contentCacheTotal = totalReadings + totalHoroscope;
  const conversionRate = totalProfiles > 0 ? Math.round((paidOrders.length / totalProfiles) * 100) : 0;

  const actionItems: AdminActionItem[] = [];
  if (failedOrders > 0) {
    actionItems.push({
      title: "处理失败订单",
      detail: `${failedOrders} 笔订单需要确认支付、补单或用户触达。`,
      href: "/admin/orders",
      priority: "high",
    });
  }
  if (cancelingSubscriptions > 0) {
    actionItems.push({
      title: "跟进取消续费",
      detail: `${cancelingSubscriptions} 个活跃订阅已标记周期末取消。`,
      href: "/admin/subscriptions",
      priority: "medium",
    });
  }
  if (pendingRewards > 0) {
    actionItems.push({
      title: "补发邀请奖励",
      detail: `${pendingRewards} 条已转化邀请还没有发放奖励。`,
      href: "/admin/referrals",
      priority: "medium",
    });
  }
  if (staleTelegramAccounts > 0) {
    actionItems.push({
      title: "唤醒 Telegram 用户",
      detail: `${staleTelegramAccounts} 个 Telegram 用户超过 7 天未活跃。`,
      href: "/admin/telegram",
      priority: "low",
    });
  }

  return {
    kpis: {
      users: {
        label: "用户资料",
        value: String(totalProfiles),
        hint: `今日新增 ${input.profiles.filter((user) => isToday(user.created_at, dayStart)).length}`,
        tone: "amber",
        href: "/admin/users",
      },
      revenueUsd: {
        label: "美元收入",
        value: formatUsd(paidUsd),
        hint: `${paidOrders.length} 笔已支付订单`,
        tone: "emerald",
        href: "/admin/orders",
      },
      starsRevenue: {
        label: "Stars 收入",
        value: String(paidStars),
        hint: "Telegram Stars 已支付订单",
        tone: "cyan",
        href: "/admin/orders",
      },
      activeSubscriptions: {
        label: "活跃订阅",
        value: String(input.totals?.subscriptions ? `${activeSubscriptions.length}/${totalSubscriptions}` : activeSubscriptions.length),
        hint: `${cancelingSubscriptions} 个周期末取消`,
        tone: cancelingSubscriptions > 0 ? "rose" : "emerald",
        href: "/admin/subscriptions",
      },
      healthAssessments: {
        label: "健康测评",
        value: String(totalHealthAssessments),
        hint: `今日完成 ${input.healthAssessments.filter((item) => isToday(item.created_at, dayStart)).length}`,
        tone: "rose",
        href: "/admin/health",
      },
      telegramUsers: {
        label: "Telegram 用户",
        value: String(totalTelegramAccounts),
        hint: `今日事件 ${input.telegramEvents.filter((event) => isToday(event.created_at, dayStart)).length}`,
        tone: "cyan",
        href: "/admin/telegram",
      },
      referrals: {
        label: "邀请关系",
        value: String(totalReferrals),
        hint: `${pendingRewards} 条奖励待处理`,
        tone: pendingRewards > 0 ? "rose" : "amber",
        href: "/admin/referrals",
      },
      contentCache: {
        label: "内容缓存",
        value: String(contentCacheTotal),
        hint: `${totalReadings} 图谱洞察 / ${totalHoroscope} 每日趋势`,
        tone: "amber",
        href: "/admin/readings",
      },
    },
    today: {
      users: input.profiles.filter((user) => isToday(user.created_at, dayStart)).length,
      orders: input.orders.filter((order) => isToday(order.created_at, dayStart)).length,
      revenueUsd: paidOrders
        .filter((order) => order.currency.toUpperCase() !== "XTR" && isToday(order.paid_at, dayStart))
        .reduce((sum, order) => sum + (order.amount || 0), 0) / 100,
      healthAssessments: input.healthAssessments.filter((item) => isToday(item.created_at, dayStart)).length,
      telegramEvents: input.telegramEvents.filter((event) => isToday(event.created_at, dayStart)).length,
    },
    risks: {
      failedOrders,
      cancelingSubscriptions,
      pendingRewards,
      staleTelegramAccounts,
    },
    funnel: {
      profiles: totalProfiles,
      paidOrders: paidOrders.length,
      activeSubscriptions: activeSubscriptions.length,
      healthAssessments: totalHealthAssessments,
      conversionRate,
    },
    channels: countBy(input.orders, (order) => order.payment_provider).map((item) => ({
      ...item,
      tone: item.label === "telegram_stars" ? "cyan" : "emerald",
    })),
    plans: countBy(input.orders, (order) => order.tier).slice(0, 4),
    actionItems,
  };
}
