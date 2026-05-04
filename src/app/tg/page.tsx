import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import BrandMark from "@/components/BrandMark";
import { formatStarsPrice } from "@/lib/pricing";

const todaySignals = [
  { label: "今日关键词", value: "守中" },
  { label: "行动方向", value: "先定后动" },
  { label: "能量提示", value: "轻装前行" },
];

const entryCards = [
  {
    href: "/daily",
    title: "查看今日节奏",
    desc: "先获得一张轻量的今日行动卡，适合收藏或分享。",
    badge: "免费开始",
  },
  {
    href: "/fortune",
    title: "生成我的图谱",
    desc: "用出生日期建立个人结构，看到优势、压力和下一步。",
    badge: "深度分析",
  },
];

const starProducts = [
  {
    name: "今日洞察",
    price: formatStarsPrice("health_report"),
    desc: "解锁今日更完整的行动提示",
  },
  {
    name: "完整图谱",
    price: formatStarsPrice("fortune_pro"),
    desc: "获得个人结构与关系沟通建议",
  },
  {
    name: "Pro 月度",
    price: formatStarsPrice("fortune_master"),
    desc: "每日更新、关键时段与长期节奏",
  },
];

const ritualSteps = [
  { title: "看见今天", desc: "先看今日关键词，避免一上来就被信息淹没。" },
  { title: "理解自己", desc: "生成个人图谱，把模糊感受变成可观察的结构。" },
  { title: "带走卡片", desc: "把洞察做成一张可以保存、可以分享的图。" },
];

export default function TelegramEntryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030c] px-4 pb-24 pt-7 text-[#F7F1E7]">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/sanxingdui-bronze-tree.jpg"
          alt=""
          className="absolute -left-28 top-4 h-[470px] w-[330px] object-cover opacity-[0.22] blur-[1px]"
        />
        <img
          src="/images/sanxingdui-bronze-mask.jpg"
          alt=""
          className="absolute -right-24 top-0 h-[430px] w-[340px] object-cover object-[48%_38%] opacity-[0.36]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_10%,rgba(245,185,86,0.22),transparent_32%),radial-gradient(circle_at_50%_52%,rgba(20,184,166,0.12),transparent_34%),linear-gradient(180deg,rgba(5,3,12,0.62),#05030c_58%)]" />
      </div>

      <section className="relative z-10 mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-display text-xl font-bold text-amber-100">Kairós</span>
          </Link>
          <span className="rounded-full border border-amber-300/20 bg-black/28 px-3 py-1 text-[10px] tracking-[0.18em] text-amber-100/72">
            MINI APP
          </span>
        </div>

        <section className="pt-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/76">AI Eastern Insight</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-amber-50">
            打开今天的节奏
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#F7F1E7]/72">
            每一天都有自己的纹理。Kairós 会把你的个人图谱、今日趋势和行动建议，整理成一张清晰的东方洞察卡。
          </p>
        </section>

        <section className="rounded-[30px] border border-amber-300/18 bg-black/[0.36] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-amber-200/58">今日提示</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">守中而行</h2>
              <p className="mt-2 text-sm leading-6 text-[#F7F1E7]/62">
                适合先整理节奏，再推进重要决定。少一点急切，多一点判断。
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300/24 bg-amber-300/[0.10] text-2xl text-amber-100">
              鉴
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {todaySignals.map((item) => (
              <div key={item.label} className="rounded-2xl border border-amber-300/12 bg-white/[0.045] p-3 text-center">
                <p className="text-[10px] leading-4 text-amber-100/46">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-amber-50">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {entryCards.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-amber-300/12 bg-[#120d1b]/80 p-4 transition active:scale-[0.99]"
              >
                <span className="inline-flex rounded-full bg-amber-200/12 px-2.5 py-1 text-[10px] font-semibold text-amber-100/72">
                  {item.badge}
                </span>
                <span className="mt-3 block text-base font-semibold text-amber-50">{item.title}</span>
                <span className="mt-2 block min-h-[60px] text-xs leading-5 text-[#F7F1E7]/56">{item.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.045] p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/62">Stars</p>
              <h2 className="mt-1 text-xl font-semibold text-emerald-50">用星星解锁更深一层</h2>
            </div>
            <Link href="/fortune" className="shrink-0 text-xs font-semibold text-emerald-100/70">
              去解锁
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {starProducts.map((product) => (
              <Link
                key={product.name}
                href={product.name === "今日洞察" ? "/daily" : "/fortune"}
                className="flex items-center gap-3 rounded-2xl border border-emerald-300/12 bg-black/22 p-3 transition active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-300/[0.10] font-data text-lg font-bold text-emerald-100">
                  {product.price.replace(" ★", "")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-emerald-50">{product.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-emerald-50/58">{product.desc}</span>
                </span>
                <span className="text-lg text-emerald-100/64">★</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-purple-200/60">Ritual</p>
            <h2 className="mt-1 text-xl font-semibold text-amber-50">三步完成今日入场</h2>
          </div>
          <div className="grid gap-3">
            {ritualSteps.map((step, index) => (
              <div key={step.title} className="flex gap-3 rounded-2xl border border-purple-300/14 bg-purple-300/[0.045] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-300/[0.10] font-data text-sm font-semibold text-purple-100">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-purple-50">{step.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-purple-50/58">{step.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/daily"
          className="flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(217,119,6,0.24)] transition active:scale-[0.99]"
        >
          先看今日节奏
        </Link>
      </section>

      <BottomNav />
    </main>
  );
}
