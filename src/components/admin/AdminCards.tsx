import type { ReactNode } from "react";

export function AdminStatCard({ label, value, hint, tone = "amber" }: { label: string; value: string; hint: string; tone?: "amber" | "emerald" | "rose" | "cyan" }) {
  const toneClass = {
    amber: "from-amber-500/18 text-amber-800",
    emerald: "from-emerald-500/18 text-emerald-800",
    rose: "from-rose-500/18 text-rose-800",
    cyan: "from-cyan-500/18 text-cyan-800",
  }[tone];

  return (
    <div className={`rounded-lg border border-stone-300/80 bg-gradient-to-br ${toneClass} to-white p-4 shadow-sm`}>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-stone-500">{hint}</div>
    </div>
  );
}

export function AdminPanel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-300/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-800">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const normalized = status || "unknown";
  const cls = ["paid", "active", "converted", "trialing"].includes(normalized)
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : ["failed", "canceled", "inactive"].includes(normalized)
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{normalized}</span>;
}
