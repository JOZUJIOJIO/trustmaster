"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";

const navItems = [
  { href: "/", icon: "🏠", labelKey: "nav.home" },
  { href: "/fortune", icon: "✨", labelKey: "nav.fortune" },
  { href: "/favorites", icon: "❤️", labelKey: "nav.favorites" },
  { href: "/profile", icon: "👤", labelKey: "nav.profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 lg:hidden">
      <div className="flex justify-around items-center h-16 pb-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[10px] ${
                active ? "text-amber-800" : "text-gray-400"
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
