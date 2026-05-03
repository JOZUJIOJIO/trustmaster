"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "登录失败");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#15110d] px-4 py-10 text-stone-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-xl border border-amber-200/15 bg-[#1d1712] shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-[url('/images/sanxingdui-bronze-mask.jpg')] bg-cover bg-center lg:block">
            <div className="h-full min-h-[560px] bg-gradient-to-br from-black/50 via-black/70 to-[#15110d]" />
          </section>
          <section className="p-6 sm:p-10">
            <Link href="/" className="text-xs uppercase tracking-[0.25em] text-amber-200/50">← Kairós</Link>
            <div className="mt-20">
              <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/45">Admin Console</p>
              <h1 className="mt-3 text-3xl font-bold">管理后台登录</h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                使用服务端管理员口令进入。这里用于查看用户、订单、订阅、健康报告与推荐数据。
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs text-stone-400">ADMIN_ACCESS_TOKEN</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/40"
                  placeholder="输入管理员口令"
                />
              </label>
              {error && <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
              <button disabled={isPending || !password} className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50">
                {isPending ? "登录中..." : "进入后台"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
