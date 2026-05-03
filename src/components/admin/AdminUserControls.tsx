"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AdminUserControls({
  userId,
  displayName,
  freeReadings,
  preferredLocale,
}: {
  userId: string;
  displayName: string | null;
  freeReadings: number;
  preferredLocale: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName || "");
  const [reads, setReads] = useState(String(freeReadings));
  const [locale, setLocale] = useState(preferredLocale || "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const save = () => {
    setMessage("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: name || null,
          preferred_locale: locale || null,
          free_readings: Number(reads) || 0,
        }),
      });
      setMessage(res.ok ? "已保存" : "保存失败");
      router.refresh();
    });
  };

  return (
    <div className="grid min-w-[560px] grid-cols-[1fr_90px_100px_80px] items-center gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-stone-300 px-2 py-1.5 text-xs" placeholder="昵称" />
      <input value={reads} onChange={(e) => setReads(e.target.value)} className="rounded-md border border-stone-300 px-2 py-1.5 text-xs" inputMode="numeric" />
      <input value={locale} onChange={(e) => setLocale(e.target.value)} className="rounded-md border border-stone-300 px-2 py-1.5 text-xs" placeholder="zh/en" />
      <button onClick={save} disabled={isPending} className="rounded-md bg-stone-900 px-2 py-1.5 text-xs font-medium text-white disabled:opacity-50">
        {isPending ? "..." : "保存"}
      </button>
      {message && <span className="col-span-4 text-[11px] text-stone-500">{message}</span>}
    </div>
  );
}
