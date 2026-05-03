import { requireAdmin } from "@/lib/admin/page-auth";
import { listAdminTable, formatDate } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminReadingsPage() {
  await requireAdmin();
  const [readings, horoscope] = await Promise.all([
    listAdminTable<Database["public"]["Tables"]["readings_cache"]["Row"]>("readings_cache", 80),
    listAdminTable<Database["public"]["Tables"]["horoscope_cache"]["Row"]>("horoscope_cache", 80),
  ]);

  return (
    <AdminShell title="内容缓存" description="查看 AI 图谱洞察缓存和每日趋势缓存，判断内容生成和复用情况。">
      {[readings.error, horoscope.error].filter(Boolean).map((error) => (
        <div key={error} className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
      ))}
      <div className="grid gap-5 xl:grid-cols-2">
        <AdminPanel title={`图谱洞察缓存 · ${readings.count}`}>
          <div className="space-y-3">
            {readings.rows.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="max-w-[70%] truncate font-mono text-xs text-stone-500">{item.chart_hash}</p>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">{item.tier}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-stone-700">{JSON.stringify(item.chart_summary).slice(0, 180)}</p>
                <p className="mt-2 text-xs text-stone-400">{formatDate(item.created_at)}</p>
              </div>
            ))}
            {readings.rows.length === 0 && <p className="py-8 text-center text-sm text-stone-500">暂无图谱洞察缓存</p>}
          </div>
        </AdminPanel>
        <AdminPanel title={`每日趋势缓存 · ${horoscope.count}`}>
          <div className="space-y-3">
            {horoscope.rows.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.sign}</p>
                  <span className="text-xs text-stone-500">{item.locale} · {item.date}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-stone-700">{JSON.stringify(item.data).slice(0, 180)}</p>
                <p className="mt-2 text-xs text-stone-400">{formatDate(item.created_at)}</p>
              </div>
            ))}
            {horoscope.rows.length === 0 && <p className="py-8 text-center text-sm text-stone-500">暂无每日趋势缓存</p>}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
