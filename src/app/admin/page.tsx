import Link from "next/link";
import { requireAdmin } from "@/lib/admin/page-auth";
import { getAdminDashboardData, formatDate, formatMoney } from "@/lib/admin/data";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel, AdminSectionHeader, AdminStatCard, StatusBadge } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const { status, insights, recentOrders, recentUsers } = await getAdminDashboardData();
  const kpis = Object.values(insights.kpis);
  const maxFunnel = Math.max(insights.funnel.profiles, insights.funnel.paidOrders, insights.funnel.activeSubscriptions, insights.funnel.healthAssessments, 1);
  const maxChannel = Math.max(...insights.channels.map((item) => item.value), 1);
  const maxPlan = Math.max(...insights.plans.map((item) => item.value), 1);

  return (
    <AdminShell title="运营后台" description="统一承接用户、收入、订阅、内容、健康业务、Telegram 和邀请增长。">
      {status.error && (
        <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {status.error}
        </div>
      )}

      <section className="rounded-lg border border-stone-300/80 bg-[#17130f] px-5 py-5 text-stone-100 shadow-sm lg:px-6">
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/70">Kairos Operating Room</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">今日运营状态</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-300">
              先看当天新增、成交、健康业务和 Telegram 触达，再进入订单、用户、订阅、邀请等分区处理具体事项。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            <TodayMetric label="新增用户" value={insights.today.users} />
            <TodayMetric label="新增订单" value={insights.today.orders} />
            <TodayMetric label="今日收入" value={formatMoney(insights.today.revenueUsd)} />
            <TodayMetric label="TG 事件" value={insights.today.telegramEvents} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <AdminSectionHeader eyebrow="Command Metrics" title="核心运营指标" description="把后台要盯的业务面收在一屏：增长、收入、订阅、内容产能、Telegram 与推荐链路。" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <AdminStatCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} tone={kpi.tone} href={kpi.href} />
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminPanel
          title="待处理事项"
          action={<span className="text-xs text-stone-400">{insights.actionItems.length > 0 ? `${insights.actionItems.length} 项` : "暂无"}</span>}
        >
          <div className="space-y-3">
            {insights.actionItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-lg border border-stone-200 p-3 transition hover:border-amber-300 hover:bg-amber-50/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-stone-900">{item.title}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${priorityClass(item.priority)}`}>{item.priority}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-stone-600">{item.detail}</p>
              </Link>
            ))}
            {insights.actionItems.length === 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm text-emerald-800">
                当前没有高优先级运营风险。可以继续查看最近订单、用户增长和内容缓存。
              </div>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="业务漏斗" action={<span className="text-xs text-stone-400">付费转化 {insights.funnel.conversionRate}%</span>}>
          <div className="space-y-4">
            <FunnelBar label="用户资料" value={insights.funnel.profiles} max={maxFunnel} tone="bg-amber-500" />
            <FunnelBar label="已支付订单" value={insights.funnel.paidOrders} max={maxFunnel} tone="bg-emerald-500" />
            <FunnelBar label="活跃订阅" value={insights.funnel.activeSubscriptions} max={maxFunnel} tone="bg-cyan-500" />
            <FunnelBar label="健康测评" value={insights.funnel.healthAssessments} max={maxFunnel} tone="bg-rose-500" />
          </div>
        </AdminPanel>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminPanel title="支付渠道" action={<Link className="text-xs text-amber-800 hover:underline" href="/admin/orders">查看订单</Link>}>
          <div className="space-y-3">
            {insights.channels.map((item) => (
              <FunnelBar key={item.label} label={channelLabel(item.label)} value={item.value} max={maxChannel} tone={item.tone === "cyan" ? "bg-cyan-500" : "bg-emerald-500"} />
            ))}
            {insights.channels.length === 0 && <p className="py-6 text-center text-sm text-stone-500">暂无渠道数据</p>}
          </div>
        </AdminPanel>

        <AdminPanel title="套餐分布" action={<Link className="text-xs text-amber-800 hover:underline" href="/admin/orders">全部套餐</Link>}>
          <div className="space-y-3">
            {insights.plans.map((item) => (
              <FunnelBar key={item.label} label={item.label} value={item.value} max={maxPlan} tone="bg-amber-500" />
            ))}
            {insights.plans.length === 0 && <p className="py-6 text-center text-sm text-stone-500">暂无套餐数据</p>}
          </div>
        </AdminPanel>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminPanel title="最近订单" action={<Link className="text-xs text-amber-800 hover:underline" href="/admin/orders">全部订单</Link>}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs text-stone-500">
                <tr><th className="py-2">客户</th><th>套餐</th><th>状态</th><th>时间</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2 pr-3">{order.customer_email || order.user_name || "-"}</td>
                    <td className="pr-3">{order.tier}</td>
                    <td className="pr-3"><StatusBadge status={order.status} /></td>
                    <td className="whitespace-nowrap text-xs text-stone-500">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && <tr><td className="py-6 text-center text-sm text-stone-500" colSpan={4}>暂无订单</td></tr>}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel title="最近用户" action={<Link className="text-xs text-amber-800 hover:underline" href="/admin/users">全部用户</Link>}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs text-stone-500">
                <tr><th className="py-2">昵称</th><th>免费次数</th><th>推荐码</th><th>注册</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-2 pr-3">{user.display_name || user.id.slice(0, 8)}</td>
                    <td className="pr-3">{user.free_readings ?? 0}</td>
                    <td className="pr-3 font-mono text-xs">{user.referral_code || "-"}</td>
                    <td className="whitespace-nowrap text-xs text-stone-500">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
                {recentUsers.length === 0 && <tr><td className="py-6 text-center text-sm text-stone-500" colSpan={4}>暂无用户</td></tr>}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}

function TodayMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-3">
      <p className="text-[11px] text-stone-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function FunnelBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const width = Math.max(4, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="text-stone-700">{label}</span>
        <span className="font-mono text-xs text-stone-500">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-stone-100">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function priorityClass(priority: "high" | "medium" | "low") {
  if (priority === "high") return "border-rose-200 bg-rose-50 text-rose-700";
  if (priority === "medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-cyan-200 bg-cyan-50 text-cyan-700";
}

function channelLabel(value: string) {
  if (value === "telegram_stars") return "Telegram Stars";
  if (value === "stripe") return "Stripe";
  return value;
}
