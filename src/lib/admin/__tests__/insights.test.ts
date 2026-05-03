import { describe, expect, it } from "vitest";
import { buildAdminInsights } from "@/lib/admin/insights";

const now = new Date("2026-05-03T10:00:00.000Z");

describe("buildAdminInsights", () => {
  it("summarizes revenue, active subscriptions, and same-day activity", () => {
    const insights = buildAdminInsights({
      now,
      profiles: [
        { id: "u1", created_at: "2026-05-03T01:00:00.000Z", display_name: null, preferred_locale: "zh", referral_code: "K1", referred_by: null, free_readings: 1 },
        { id: "u2", created_at: "2026-05-01T01:00:00.000Z", display_name: null, preferred_locale: "en", referral_code: "K2", referred_by: "K1", free_readings: 0 },
      ],
      orders: [
        { id: "o1", status: "paid", amount: 990, currency: "USD", tier: "pro", payment_provider: "stripe", created_at: "2026-05-03T02:00:00.000Z", paid_at: "2026-05-03T02:03:00.000Z", customer_email: "a@example.com", user_name: "A", user_id: "u1", telegram_user_id: null, chart_id: "c1", stripe_session_id: "cs_1", stripe_payment_intent: null, telegram_payment_charge_id: null, reading_data: null },
        { id: "o2", status: "paid", amount: 150, currency: "XTR", tier: "mini", payment_provider: "telegram_stars", created_at: "2026-05-02T02:00:00.000Z", paid_at: "2026-05-02T02:03:00.000Z", customer_email: null, user_name: "B", user_id: null, telegram_user_id: 123, chart_id: "c2", stripe_session_id: "tg_1", stripe_payment_intent: null, telegram_payment_charge_id: "charge_1", reading_data: null },
        { id: "o3", status: "failed", amount: 1990, currency: "USD", tier: "pro", payment_provider: "stripe", created_at: "2026-05-03T03:00:00.000Z", paid_at: null, customer_email: "b@example.com", user_name: "B", user_id: "u2", telegram_user_id: null, chart_id: "c3", stripe_session_id: "cs_2", stripe_payment_intent: null, telegram_payment_charge_id: null, reading_data: null },
      ],
      subscriptions: [
        { id: "s1", user_id: "u1", status: "active", plan: "monthly", cancel_at_period_end: false, stripe_customer_id: "cus_1", stripe_subscription_id: "sub_1", current_period_start: null, current_period_end: null, created_at: "2026-05-03T02:00:00.000Z", updated_at: "2026-05-03T02:00:00.000Z" },
        { id: "s2", user_id: "u2", status: "trialing", plan: "monthly", cancel_at_period_end: true, stripe_customer_id: "cus_2", stripe_subscription_id: "sub_2", current_period_start: null, current_period_end: null, created_at: "2026-05-01T02:00:00.000Z", updated_at: "2026-05-01T02:00:00.000Z" },
      ],
      healthAssessments: [],
      healthConversations: [],
      referrals: [],
      readings: [],
      horoscope: [],
      telegramAccounts: [],
      telegramEvents: [{ id: "e1", event_name: "mini_app_open", telegram_user_id: 123, path: "/tg", start_param: "ref_K1", metadata: {}, created_at: "2026-05-03T05:00:00.000Z" }],
    });

    expect(insights.kpis.revenueUsd.value).toBe("$10");
    expect(insights.kpis.starsRevenue.value).toBe("150");
    expect(insights.kpis.activeSubscriptions.value).toBe("2");
    expect(insights.today.users).toBe(1);
    expect(insights.today.orders).toBe(2);
    expect(insights.today.telegramEvents).toBe(1);
    expect(insights.risks.failedOrders).toBe(1);
    expect(insights.risks.cancelingSubscriptions).toBe(1);
  });

  it("creates prioritized action items for operational risks", () => {
    const insights = buildAdminInsights({
      now,
      profiles: [],
      orders: [{ id: "o1", status: "failed", amount: 990, currency: "USD", tier: "pro", payment_provider: "stripe", created_at: "2026-05-03T02:00:00.000Z", paid_at: null, customer_email: "a@example.com", user_name: "A", user_id: "u1", telegram_user_id: null, chart_id: "c1", stripe_session_id: "cs_1", stripe_payment_intent: null, telegram_payment_charge_id: null, reading_data: null }],
      subscriptions: [{ id: "s1", user_id: "u1", status: "active", plan: "monthly", cancel_at_period_end: true, stripe_customer_id: "cus_1", stripe_subscription_id: "sub_1", current_period_start: null, current_period_end: null, created_at: "2026-05-01T02:00:00.000Z", updated_at: "2026-05-01T02:00:00.000Z" }],
      healthAssessments: [],
      healthConversations: [],
      referrals: [{ id: "r1", referrer_id: "u1", referred_id: "u2", status: "converted", reward_given: false, created_at: "2026-05-02T02:00:00.000Z", converted_at: "2026-05-03T02:00:00.000Z" }],
      readings: [],
      horoscope: [],
      telegramAccounts: [],
      telegramEvents: [],
    });

    expect(insights.actionItems.map((item) => item.title)).toEqual([
      "处理失败订单",
      "跟进取消续费",
      "补发邀请奖励",
    ]);
    expect(insights.actionItems[0].href).toBe("/admin/orders");
  });
});
