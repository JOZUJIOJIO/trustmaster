import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "总览", icon: "⌘" },
  { href: "/admin/users", label: "用户", icon: "◎" },
  { href: "/admin/orders", label: "订单", icon: "¥" },
  { href: "/admin/subscriptions", label: "订阅", icon: "∞" },
  { href: "/admin/health", label: "健康", icon: "✚" },
  { href: "/admin/telegram", label: "Telegram", icon: "✈" },
  { href: "/admin/referrals", label: "邀请", icon: "↗" },
  { href: "/admin/readings", label: "缓存", icon: "▦" },
];

export function AdminShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f0e8] text-[#17130f]">
      <div className="lg:flex">
        <aside className="border-b border-stone-300/70 bg-[#15110d] text-stone-100 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r lg:border-stone-800">
          <div className="flex h-16 items-center justify-between px-5 lg:h-20">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-amber-200">K</span>
              <span>
                <span className="block text-sm font-semibold tracking-[0.16em]">KAIROS</span>
                <span className="block text-[10px] text-stone-400">Management</span>
              </span>
            </Link>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-stone-300 transition hover:bg-white/10">退出</button>
            </form>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-4 lg:pb-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-300 transition hover:bg-white/8 hover:text-white lg:min-w-0"
              >
                <span className="w-5 text-center text-amber-200/70">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="lg:ml-64 lg:min-h-screen lg:flex-1">
          <header className="border-b border-stone-300/70 bg-[#f8f5ee]/85 px-4 py-5 backdrop-blur lg:px-8 lg:py-7">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.26em] text-amber-800/60">Traditional Admin Console</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
                <p className="mt-1 text-sm text-stone-600">{description}</p>
              </div>
              <Link href="/" className="w-fit rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm transition hover:bg-stone-50">
                查看前台
              </Link>
            </div>
          </header>
          <div className="px-4 py-5 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
