import { requireAdmin } from "@/lib/admin/page-auth";
import { listAdminTable, formatDate } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel, StatusBadge } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const result = await listAdminTable<Database["public"]["Tables"]["subscriptions"]["Row"]>("subscriptions", 100);

  return (
    <AdminShell title="订阅管理" description="查看会员计划、订阅周期、取消状态与 Stripe 订阅编号。">
      {result.error && <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{result.error}</div>}
      <AdminPanel title={`订阅列表 · ${result.count}`}>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="text-xs text-stone-500">
              <tr><th className="py-2">用户</th><th>计划</th><th>状态</th><th>周期开始</th><th>周期结束</th><th>取消续费</th><th>Stripe</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {result.rows.map((sub) => (
                <tr key={sub.id}>
                  <td className="py-3 pr-3 font-mono text-xs">{sub.user_id || "-"}</td>
                  <td className="pr-3">{sub.plan}</td>
                  <td className="pr-3"><StatusBadge status={sub.status} /></td>
                  <td className="whitespace-nowrap pr-3 text-xs text-stone-500">{formatDate(sub.current_period_start)}</td>
                  <td className="whitespace-nowrap pr-3 text-xs text-stone-500">{formatDate(sub.current_period_end)}</td>
                  <td className="pr-3">{sub.cancel_at_period_end ? "是" : "否"}</td>
                  <td className="max-w-[220px] truncate font-mono text-xs">{sub.stripe_subscription_id}</td>
                </tr>
              ))}
              {result.rows.length === 0 && <tr><td className="py-8 text-center text-stone-500" colSpan={7}>暂无订阅数据</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
