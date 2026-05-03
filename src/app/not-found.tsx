import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#12101c] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mb-4 flex justify-center"><BrandMark size="lg" /></div>
        <h1 className="font-display text-3xl font-bold text-amber-100">此页不在图谱之中</h1>
        <p className="text-amber-200/50 text-sm">This page is outside the current map, but these paths are open:</p>

        <div className="space-y-3 text-left">
          {[
            { href: "/fortune", icon: "☯", label: "个人图谱", labelEn: "Personal Map" },
            { href: "/daily", icon: "📅", label: "每日趋势", labelEn: "Daily Trends" },
            { href: "/compatibility", icon: "💑", label: "双人合盘", labelEn: "Compatibility" },
            { href: "/learn", icon: "📖", label: "了解体系", labelEn: "Learn" },
            { href: "/", icon: "🏠", label: "返回首页", labelEn: "Home" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl px-4 py-3 border border-amber-400/10 transition-all"
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <span className="text-amber-200/70 text-sm">{item.label}</span>
                <span className="text-amber-200/30 text-xs ml-2">{item.labelEn}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
