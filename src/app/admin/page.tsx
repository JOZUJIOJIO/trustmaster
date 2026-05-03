import Link from "next/link";
import { requireAdmin } from "@/lib/admin/page-auth";
import { getAdminDashboardData, formatDate, formatMoney } from "@/lib/admin/data";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel, AdminStatCard, StatusBadge } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const { status, stats, recentOrders, recentUsers } = await getAdminDashboardData();

  return (
    <AdminShell title="业务总览" description="统一查看前台用户、成交、订阅、健康报告和推荐增长。">
      {status.error && (
        <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {status.error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="用户资料" value={String(stats.users)} hint="profiles 总数" />
        <AdminStatCard label="付费订单" value={String(stats.orders)} hint="orders 总数" tone="emerald" />
        <AdminStatCard label="订单收入" value={formatMoney(stats.revenueUsd)} hint="按最近查询订单估算" tone="cyan" />
        <AdminStatCard label="健康测评" value={String(stats.healthAssessments)} hint="assessment 沉淀" tone="rose" />
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
                    <td className="pr-3">{user.free_readings}</td>
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

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <AdminStatCard label="活跃订阅" value={String(stats.activeSubscriptions)} hint="active / trialing" tone="emerald" />
        <AdminStatCard label="邀请关系" value={String(stats.referrals)} hint="referrals 总数" />
        <AdminStatCard label="AI 缓存" value={String(stats.readings)} hint="reading cache 总数" tone="cyan" />
      </div>
    </AdminShell>
  );
}
