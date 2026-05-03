import { requireAdmin } from "@/lib/admin/page-auth";
import { listAdminTable, formatDate } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel, StatusBadge } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  await requireAdmin();
  const result = await listAdminTable<Database["public"]["Tables"]["referrals"]["Row"]>("referrals", 100);

  return (
    <AdminShell title="邀请增长" description="查看邀请关系、转化状态和奖励发放情况。">
      {result.error && <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{result.error}</div>}
      <AdminPanel title={`邀请关系 · ${result.count}`}>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-xs text-stone-500">
              <tr><th className="py-2">邀请人</th><th>被邀请人</th><th>状态</th><th>奖励</th><th>创建</th><th>转化</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {result.rows.map((ref) => (
                <tr key={ref.id}>
                  <td className="py-3 pr-3 font-mono text-xs">{ref.referrer_id}</td>
                  <td className="pr-3 font-mono text-xs">{ref.referred_id}</td>
                  <td className="pr-3"><StatusBadge status={ref.status} /></td>
                  <td className="pr-3">{ref.reward_given ? "已发放" : "未发放"}</td>
                  <td className="whitespace-nowrap pr-3 text-xs text-stone-500">{formatDate(ref.created_at)}</td>
                  <td className="whitespace-nowrap text-xs text-stone-500">{formatDate(ref.converted_at)}</td>
                </tr>
              ))}
              {result.rows.length === 0 && <tr><td className="py-8 text-center text-stone-500" colSpan={6}>暂无邀请数据</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
