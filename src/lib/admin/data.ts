import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildAdminInsights } from "@/lib/admin/insights";
import type { Database } from "@/lib/supabase/database.types";

type TableName = keyof Database["public"]["Tables"];
type AdminQueryResult<T> = {
  rows: T[];
  count: number;
  error?: string;
};

export type AdminStats = {
  users: number;
  orders: number;
  revenueUsd: number;
  activeSubscriptions: number;
  healthAssessments: number;
  referrals: number;
  readings: number;
};

export type AdminDataStatus = {
  configured: boolean;
  error?: string;
};

function missingClient<T>(): AdminQueryResult<T> {
  return {
    rows: [],
    count: 0,
    error: "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  };
}

export async function listAdminTable<T>(table: TableName, limit = 50): Promise<AdminQueryResult<T>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return missingClient<T>();

  const { data, error, count } = await supabase
    .from(table)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<T[]>();

  return {
    rows: data || [],
    count: count || data?.length || 0,
    error: error?.message,
  };
}

export async function getAdminDashboardData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      status: {
        configured: false,
        error: "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      } satisfies AdminDataStatus,
      stats: {
        users: 0,
        orders: 0,
        revenueUsd: 0,
        activeSubscriptions: 0,
        healthAssessments: 0,
        referrals: 0,
        readings: 0,
      } satisfies AdminStats,
      recentOrders: [] as Database["public"]["Tables"]["orders"]["Row"][],
      recentUsers: [] as Database["public"]["Tables"]["profiles"]["Row"][],
      insights: buildAdminInsights({
        profiles: [],
        orders: [],
        subscriptions: [],
        healthAssessments: [],
        healthConversations: [],
        referrals: [],
        readings: [],
        horoscope: [],
        telegramAccounts: [],
        telegramEvents: [],
      }),
    };
  }

  const [
    users,
    orders,
    subscriptions,
    health,
    healthConversations,
    referrals,
    readings,
    horoscope,
    telegramAccounts,
    telegramEvents,
  ] = await Promise.all([
    listAdminTable<Database["public"]["Tables"]["profiles"]["Row"]>("profiles", 200),
    listAdminTable<Database["public"]["Tables"]["orders"]["Row"]>("orders", 200),
    listAdminTable<Database["public"]["Tables"]["subscriptions"]["Row"]>("subscriptions", 200),
    listAdminTable<Database["public"]["Tables"]["health_assessments"]["Row"]>("health_assessments", 200),
    listAdminTable<Database["public"]["Tables"]["health_conversations"]["Row"]>("health_conversations", 120),
    listAdminTable<Database["public"]["Tables"]["referrals"]["Row"]>("referrals", 200),
    listAdminTable<Database["public"]["Tables"]["readings_cache"]["Row"]>("readings_cache", 120),
    listAdminTable<Database["public"]["Tables"]["horoscope_cache"]["Row"]>("horoscope_cache", 120),
    listAdminTable<Database["public"]["Tables"]["telegram_accounts"]["Row"]>("telegram_accounts", 200),
    listAdminTable<Database["public"]["Tables"]["telegram_events"]["Row"]>("telegram_events", 200),
  ]);

  const revenueUsd = orders.rows
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + (order.amount || 0), 0) / 100;

  const insights = buildAdminInsights({
    totals: {
      profiles: users.count,
      orders: orders.count,
      healthAssessments: health.count,
      referrals: referrals.count,
      readings: readings.count,
      horoscope: horoscope.count,
      telegramAccounts: telegramAccounts.count,
    },
    profiles: users.rows,
    orders: orders.rows,
    subscriptions: subscriptions.rows,
    healthAssessments: health.rows,
    healthConversations: healthConversations.rows,
    referrals: referrals.rows,
    readings: readings.rows,
    horoscope: horoscope.rows,
    telegramAccounts: telegramAccounts.rows,
    telegramEvents: telegramEvents.rows,
  });

  return {
    status: {
      configured: true,
      error: [users, orders, subscriptions, health, healthConversations, referrals, readings, horoscope, telegramAccounts, telegramEvents].find((r) => r.error)?.error,
    } satisfies AdminDataStatus,
    stats: {
      users: users.count,
      orders: orders.count,
      revenueUsd,
      activeSubscriptions: subscriptions.rows.filter((sub) => ["active", "trialing"].includes(sub.status)).length,
      healthAssessments: health.count,
      referrals: referrals.count,
      readings: readings.count,
    } satisfies AdminStats,
    recentOrders: orders.rows.slice(0, 8),
    recentUsers: users.rows.slice(0, 8),
    insights,
  };
}

export function formatMoney(amount: number, currency = "USD") {
  if (currency.toUpperCase() === "XTR") {
    return `${Math.round(amount)} Stars`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
