"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";

const navItems = [
  { href: "/", icon: "🏠", labelKey: "nav.home" },
  { href: "/daily", icon: "📅", labelKey: "nav.daily" },
  { href: "/fortune", icon: "☯", labelKey: "nav.fortune" },
  { href: "/favorites", icon: "❤️", labelKey: "nav.favorites" },
  { href: "/profile", icon: "👤", labelKey: "nav.profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0814]/90 backdrop-blur-md border-t border-amber-400/10">
      <div className="flex justify-around items-center h-16 pb-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
                active ? "text-amber-400" : "text-amber-200/30"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
