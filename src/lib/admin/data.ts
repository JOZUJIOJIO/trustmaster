import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
    };
  }

  const [users, orders, subscriptions, health, referrals, readings] = await Promise.all([
    listAdminTable<Database["public"]["Tables"]["profiles"]["Row"]>("profiles", 8),
    listAdminTable<Database["public"]["Tables"]["orders"]["Row"]>("orders", 8),
    listAdminTable<Database["public"]["Tables"]["subscriptions"]["Row"]>("subscriptions", 8),
    listAdminTable<Database["public"]["Tables"]["health_assessments"]["Row"]>("health_assessments", 8),
    listAdminTable<Database["public"]["Tables"]["referrals"]["Row"]>("referrals", 8),
    listAdminTable<Database["public"]["Tables"]["readings_cache"]["Row"]>("readings_cache", 8),
  ]);

  const revenueUsd = orders.rows
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + (order.amount || 0), 0) / 100;

  return {
    status: {
      configured: true,
      error: [users, orders, subscriptions, health, referrals, readings].find((r) => r.error)?.error,
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
    recentOrders: orders.rows,
    recentUsers: users.rows,
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
