"use client";

import { useState } from "react";

export default function Accordion({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/[0.03] border border-amber-400/10 rounded-2xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <h3 className="text-xs text-amber-400/50 tracking-widest">{title}</h3>
        </div>
        <svg
          className={`w-4 h-4 text-amber-400/30 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}
