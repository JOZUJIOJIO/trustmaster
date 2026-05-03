import { requireAdmin } from "@/lib/admin/page-auth";
import { listAdminTable, formatDate } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminHealthPage() {
  await requireAdmin();
  const [assessments, readings, conversations] = await Promise.all([
    listAdminTable<Database["public"]["Tables"]["health_assessments"]["Row"]>("health_assessments", 100),
    listAdminTable<Database["public"]["Tables"]["health_readings_cache"]["Row"]>("health_readings_cache", 80),
    listAdminTable<Database["public"]["Tables"]["health_conversations"]["Row"]>("health_conversations", 80),
  ]);

  return (
    <AdminShell title="健康业务管理" description="查看体质测评、健康报告缓存和 AI 对话记录。">
      {[assessments.error, readings.error, conversations.error].filter(Boolean).map((error) => (
        <div key={error} className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
      ))}
      <div className="grid gap-5 xl:grid-cols-2">
        <AdminPanel title={`体质测评 · ${assessments.count}`}>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-xs text-stone-500"><tr><th className="py-2">用户</th><th>主型</th><th>副型</th><th>五行分</th><th>创建</th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {assessments.rows.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-3 font-mono text-xs">{item.user_id}</td>
                    <td className="pr-3">{item.constitution_type}</td>
                    <td className="pr-3">{item.secondary_type || "-"}</td>
                    <td className="pr-3 text-xs">{Object.entries(item.five_elements_score).map(([k, v]) => `${k}:${v}`).join(" ")}</td>
                    <td className="whitespace-nowrap text-xs text-stone-500">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
                {assessments.rows.length === 0 && <tr><td className="py-8 text-center text-stone-500" colSpan={5}>暂无测评</td></tr>}
              </tbody>
            </table>
          </div>
        </AdminPanel>
        <AdminPanel title={`AI 对话 · ${conversations.count}`}>
          <div className="space-y-2">
            {conversations.rows.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex justify-between gap-3 text-xs text-stone-500">
                  <span className="font-mono">{item.user_id}</span>
                  <span>{formatDate(item.updated_at)}</span>
                </div>
                <p className="mt-2 text-sm text-stone-700">消息数：{item.message_count} · Assessment：<span className="font-mono text-xs">{item.assessment_id}</span></p>
              </div>
            ))}
            {conversations.rows.length === 0 && <p className="py-8 text-center text-sm text-stone-500">暂无对话</p>}
          </div>
        </AdminPanel>
      </div>
      <div className="mt-5">
        <AdminPanel title={`健康报告缓存 · ${readings.count}`}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {readings.rows.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-3">
                <p className="font-mono text-xs text-stone-500">{item.assessment_id}</p>
                <p className="mt-2 line-clamp-3 text-sm text-stone-700">{item.reading.summary}</p>
                <p className="mt-2 text-xs text-stone-400">{formatDate(item.created_at)}</p>
              </div>
            ))}
            {readings.rows.length === 0 && <p className="py-8 text-center text-sm text-stone-500 md:col-span-2 xl:col-span-3">暂无报告缓存</p>}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
