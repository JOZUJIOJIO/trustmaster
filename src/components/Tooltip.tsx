"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/bazi-glossary";

export function Term({ k, children }: { k: string; children?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const entry = GLOSSARY[k];
  if (!entry) return <span>{children || k}</span>;

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center gap-0.5 cursor-help border-b border-dotted border-amber-400/30 hover:border-amber-400/60 transition-colors"
      >
        {children || entry.term}
        <span className="text-amber-400/40 text-[10px] ml-0.5">ⓘ</span>
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1a1520] border border-amber-400/20 rounded-xl shadow-xl shadow-black/50 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-bold text-amber-300">{entry.term}</span>
            <span className="text-[10px] text-amber-200/30">{entry.termEn}</span>
          </div>
          <p className="text-[11px] text-amber-100/60 leading-relaxed">{entry.desc}</p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1520] border-r border-b border-amber-400/20 rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}
