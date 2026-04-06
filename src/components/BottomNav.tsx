"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";

const navItems = [
  { href: "/", icon: "🏠", labelKey: "nav.home" },
  { href: "/fortune", icon: "☯", labelKey: "nav.fortune" },
  { href: "/health", icon: "🌿", labelKey: "nav.health" },
  { href: "/profile", icon: "👤", labelKey: "nav.profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0814]/90 backdrop-blur-md border-t border-amber-400/10 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] text-xs transition-colors ${
                active ? "text-amber-400" : "text-amber-200/30"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px]">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
