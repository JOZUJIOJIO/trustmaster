import Link from "next/link";

const modules = [
  { href: "/fortune", title: "命盘解读", desc: "四柱、五行、十神、大运曲线", icon: "☯" },
  { href: "/health", title: "体质测评", desc: "五行体质、脏腑地图、食疗建议", icon: "✚" },
  { href: "/daily", title: "每日运势", desc: "每天一张趋势卡，可直接分享", icon: "◐" },
];

export default function TelegramEntryPage() {
  return (
    <main className="min-h-screen bg-[#060410] px-4 pb-24 pt-10 text-amber-50">
      <section className="mx-auto max-w-md">
        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/45">Telegram Mini App</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight">Kairós</h1>
        <p className="mt-3 text-sm leading-relaxed text-amber-100/55">
          在 Telegram 内直接生成命盘、健康报告和每日趋势卡。网页端与 Mini App 使用同一套产品和后台数据。
        </p>

        <div className="mt-8 space-y-3">
          {modules.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-4 rounded-2xl border border-amber-300/15 bg-white/[0.035] p-4 transition hover:bg-amber-300/[0.06]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/15 bg-black/20 text-xl">{item.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs text-amber-100/35">{item.desc}</span>
              </span>
              <span className="text-amber-300/35">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-300/15 bg-emerald-300/8 p-4">
          <h2 className="text-sm font-semibold text-emerald-100">已适配 Telegram</h2>
          <p className="mt-2 text-xs leading-relaxed text-emerald-100/55">
            支持 Telegram 主题、返回按钮、启动参数、推荐码和服务端身份校验。
          </p>
        </div>
      </section>
    </main>
  );
}
