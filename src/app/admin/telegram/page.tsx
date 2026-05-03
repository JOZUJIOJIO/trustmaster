import { requireAdmin } from "@/lib/admin/page-auth";
import { listAdminTable, formatDate } from "@/lib/admin/data";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPanel, AdminStatCard } from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminTelegramPage() {
  await requireAdmin();
  const [accounts, events] = await Promise.all([
    listAdminTable<Database["public"]["Tables"]["telegram_accounts"]["Row"]>("telegram_accounts", 100),
    listAdminTable<Database["public"]["Tables"]["telegram_events"]["Row"]>("telegram_events", 120),
  ]);
  const premiumCount = accounts.rows.filter((account) => account.is_premium).length;
  const referralStarts = accounts.rows.filter((account) => account.referral_code).length;

  return (
    <AdminShell title="Telegram Mini App" description="查看 Telegram 用户、Mini App 打开事件、启动参数和推荐来源。">
      {[accounts.error, events.error].filter(Boolean).map((error) => (
        <div key={error} className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
      ))}

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStatCard label="Telegram 用户" value={String(accounts.count)} hint="telegram_accounts 总数" tone="cyan" />
        <AdminStatCard label="Premium 用户" value={String(premiumCount)} hint="Telegram Premium 标记" tone="emerald" />
        <AdminStatCard label="推荐启动" value={String(referralStarts)} hint="带 ref_ 参数打开" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminPanel title={`Telegram 用户 · ${accounts.count}`}>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="text-xs text-stone-500">
                <tr><th className="py-2">Telegram ID</th><th>姓名</th><th>用户名</th><th>语言</th><th>Premium</th><th>启动参数</th><th>最近打开</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {accounts.rows.map((account) => (
                  <tr key={account.id}>
                    <td className="py-3 pr-3 font-mono text-xs">{account.telegram_user_id}</td>
                    <td className="pr-3">{[account.first_name, account.last_name].filter(Boolean).join(" ")}</td>
                    <td className="pr-3">{account.username ? `@${account.username}` : "-"}</td>
                    <td className="pr-3">{account.language_code || "-"}</td>
                    <td className="pr-3">{account.is_premium ? "是" : "否"}</td>
                    <td className="max-w-[160px] truncate pr-3 font-mono text-xs">{account.start_param || "-"}</td>
                    <td className="whitespace-nowrap text-xs text-stone-500">{formatDate(account.last_seen_at)}</td>
                  </tr>
                ))}
                {accounts.rows.length === 0 && <tr><td className="py-8 text-center text-stone-500" colSpan={7}>暂无 Telegram 用户</td></tr>}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel title={`Mini App 事件 · ${events.count}`}>
          <div className="space-y-2">
            {events.rows.map((event) => (
              <div key={event.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] text-cyan-800">{event.event_name}</span>
                  <span className="text-xs text-stone-400">{formatDate(event.created_at)}</span>
                </div>
                <div className="mt-2 grid gap-1 text-xs text-stone-600">
                  <span>用户：<span className="font-mono">{event.telegram_user_id || "-"}</span></span>
                  <span>路径：<span className="font-mono">{event.path || "-"}</span></span>
                  <span>启动参数：<span className="font-mono">{event.start_param || "-"}</span></span>
                </div>
              </div>
            ))}
            {events.rows.length === 0 && <p className="py-8 text-center text-sm text-stone-500">暂无事件</p>}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
