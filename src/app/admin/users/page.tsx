import { requireAdmin } from "@/lib/admin/page-auth";
import { listAdminTable, formatDate } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel } from "@/components/admin/AdminCards";
import { AdminUserControls } from "@/components/admin/AdminUserControls";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const result = await listAdminTable<Database["public"]["Tables"]["profiles"]["Row"]>("profiles", 100);

  return (
    <AdminShell title="用户管理" description="查看用户资料、推荐码、免费次数，并支持安全编辑基础字段。">
      {result.error && <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{result.error}</div>}
      <AdminPanel title={`用户列表 · ${result.count}`}>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="text-xs text-stone-500">
              <tr><th className="py-2">ID</th><th>注册时间</th><th>推荐码</th><th>被邀请</th><th>编辑</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {result.rows.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pr-3 font-mono text-xs">{user.id}</td>
                  <td className="pr-3 whitespace-nowrap text-xs text-stone-500">{formatDate(user.created_at)}</td>
                  <td className="pr-3 font-mono text-xs">{user.referral_code || "-"}</td>
                  <td className="pr-3 font-mono text-xs">{user.referred_by || "-"}</td>
                  <td className="pr-3">
                    <AdminUserControls userId={user.id} displayName={user.display_name} freeReadings={user.free_readings} preferredLocale={user.preferred_locale} />
                  </td>
                </tr>
              ))}
              {result.rows.length === 0 && <tr><td className="py-8 text-center text-stone-500" colSpan={5}>暂无用户数据</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
