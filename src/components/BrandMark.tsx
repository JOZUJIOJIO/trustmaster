"use client";

interface BrandMarkProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "h-7 w-7",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

export default function BrandMark({ size = "sm", className = "" }: BrandMarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-300/25 bg-[#0a0814] shadow-[0_0_18px_rgba(217,169,106,0.18)] ${sizeClasses[size]} ${className}`}
      aria-label="Kairós bronze mask"
    >
      <img
        src="/images/sanxingdui-bronze-mask.jpg"
        alt=""
        className="h-full w-full object-cover object-[48%_42%] contrast-125 saturate-110"
      />
    </span>
  );
}
