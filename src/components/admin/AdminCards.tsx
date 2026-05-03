import Link from "next/link";
import type { ReactNode } from "react";

export function AdminStatCard({
  label,
  value,
  hint,
  tone = "amber",
  href,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "amber" | "emerald" | "rose" | "cyan";
  href?: string;
}) {
  const toneClass = {
    amber: "from-amber-500/14 text-amber-900",
    emerald: "from-emerald-500/14 text-emerald-900",
    rose: "from-rose-500/14 text-rose-900",
    cyan: "from-cyan-500/14 text-cyan-900",
  }[tone];
  const card = (
    <div className={`h-full rounded-lg border border-stone-300/80 bg-gradient-to-br ${toneClass} to-white p-4 shadow-sm transition ${href ? "hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-md" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-stone-500">{label}</div>
        {href && <span className="text-sm text-stone-400">→</span>}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] leading-5 text-stone-500">{hint}</div>
    </div>
  );

  if (!href) return card;
  return <Link href={href}>{card}</Link>;
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

export function AdminSectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800/60">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
    </div>
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
