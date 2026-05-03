import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import BrandMark from "@/components/BrandMark";

const primaryModules = [
  {
    href: "/fortune",
    title: "个人图谱",
    desc: "出生日期生成四柱、五行与行动建议",
    meta: "免费开始",
    icon: "☯",
  },
  {
    href: "/daily",
    title: "每日趋势",
    desc: "每天一张适合保存和分享的趋势卡",
    meta: "轻量查看",
    icon: "◐",
  },
  {
    href: "/profile",
    title: "我的报告",
    desc: "Telegram 免注册进入，购买记录自动归档",
    meta: "原生身份",
    icon: "◫",
  },
];

const offerCards = [
  { name: "Pro", price: "500 ★", desc: "6 维 AI 洞察报告" },
  { name: "Complete", price: "1500 ★", desc: "更完整的图谱与行动清单" },
];

export default function TelegramEntryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060410] px-4 pb-24 pt-8 text-[#F2F0EB]">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/sanxingdui-bronze-tree.jpg"
          alt=""
          className="absolute -left-24 top-0 h-[420px] w-[280px] object-cover opacity-28 blur-[1px]"
        />
        <img
          src="/images/sanxingdui-bronze-mask.jpg"
          alt=""
          className="absolute -right-20 top-8 h-[360px] w-[300px] object-cover object-[45%_38%] opacity-32"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(217,169,106,0.2),transparent_34%),linear-gradient(180deg,rgba(6,4,16,0.72),#060410_62%)]" />
      </div>

      <section className="relative z-10 mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-display text-xl font-bold tracking-[0.04em] text-amber-100">Kairós</span>
          </Link>
          <span className="rounded-full border border-amber-300/20 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100/70">
            Mini App
          </span>
        </div>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/70">AI 东方个人洞察</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-amber-50">
            一分钟生成你的东方图谱
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-amber-50/72">
            用出生日期建立结构化自我观察，看到性格优势、压力模式、关系沟通和本月行动建议。Telegram 内免注册进入，解锁时直接使用 Stars。
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {offerCards.map((offer) => (
            <div key={offer.name} className="rounded-2xl border border-amber-300/16 bg-black/28 p-4 backdrop-blur-md">
              <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/55">{offer.name}</div>
              <div className="mt-1 font-data text-2xl font-semibold text-amber-200">{offer.price}</div>
              <p className="mt-1 text-[11px] leading-5 text-amber-50/52">{offer.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/fortune"
          className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(217,119,6,0.22)] transition active:scale-[0.99]"
        >
          开始生成个人图谱
        </Link>

        <div className="mt-6 space-y-3">
          {primaryModules.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-amber-300/12 bg-white/[0.035] p-4 transition hover:bg-amber-300/[0.06]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/16 bg-black/28 text-xl text-amber-100">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-amber-50">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-amber-50/50">{item.desc}</span>
              </span>
              <span className="rounded-full border border-amber-300/14 px-2.5 py-1 text-[10px] text-amber-100/56">
                {item.meta}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.06] p-4">
          <h2 className="text-sm font-semibold text-emerald-50">Telegram 原生体验</h2>
          <p className="mt-2 text-xs leading-6 text-emerald-50/60">
            无需额外注册；进入 Mini App 后使用 Telegram 身份保存报告，付款走 Stars 原生弹窗。
          </p>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
