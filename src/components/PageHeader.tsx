"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

interface PageHeaderProps {
  title: string;
  href?: string;
  showLogo?: boolean;
}

export default function PageHeader({ title, href = "/fortune", showLogo = false }: PageHeaderProps) {
  return (
    <>
      {/* Desktop */}
      <header className="hidden lg:block sticky top-0 z-50 bg-[#0a0814]/80 backdrop-blur-md border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-xl font-bold text-amber-200">TrustMaster</span>
            </Link>
            <span className="text-amber-200/20">/</span>
            <span className="text-sm text-amber-200/40">{title}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      {/* Mobile */}
      <header className="lg:hidden flex items-center justify-between h-12 px-4 border-b border-amber-400/10 sticky top-0 bg-[#0a0814]/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Link href={href} className="text-amber-200/60 hover:text-amber-200 text-lg active:scale-95 transition-transform p-2.5 -ml-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center">←</Link>
          {showLogo && <span className="text-lg">🔮</span>}
          <span className="text-[15px] font-semibold text-amber-100">{title}</span>
        </div>
        <LanguageSwitcher />
      </header>
    </>
  );
}
