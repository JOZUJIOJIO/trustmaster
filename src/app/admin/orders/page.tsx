import { requireAdmin } from "@/lib/admin/page-auth";
import { listAdminTable, formatDate, formatMoney } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel, StatusBadge } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const result = await listAdminTable<Database["public"]["Tables"]["orders"]["Row"]>("orders", 100);

  return (
    <AdminShell title="订单管理" description="查看 Stripe 支付订单、套餐、金额、用户与支付状态。">
      {result.error && <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{result.error}</div>}
      <AdminPanel title={`订单列表 · ${result.count}`}>
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full text-left text-sm">
            <thead className="text-xs text-stone-500">
              <tr><th className="py-2">客户</th><th>用户</th><th>套餐</th><th>金额</th><th>状态</th><th>Stripe Session</th><th>创建</th><th>支付</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {result.rows.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-3">{order.customer_email || order.user_name || "-"}</td>
                  <td className="pr-3 font-mono text-xs">{order.user_id || "-"}</td>
                  <td className="pr-3">{order.tier}</td>
                  <td className="pr-3">{formatMoney((order.amount || 0) / 100, order.currency || "USD")}</td>
                  <td className="pr-3"><StatusBadge status={order.status} /></td>
                  <td className="max-w-[220px] truncate pr-3 font-mono text-xs">{order.stripe_session_id}</td>
                  <td className="whitespace-nowrap pr-3 text-xs text-stone-500">{formatDate(order.created_at)}</td>
                  <td className="whitespace-nowrap text-xs text-stone-500">{formatDate(order.paid_at)}</td>
                </tr>
              ))}
              {result.rows.length === 0 && <tr><td className="py-8 text-center text-stone-500" colSpan={8}>暂无订单数据</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
