"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * 3D tilt card — follows mouse position on hover
 */
export default function TiltCard({
  children,
  className = "",
  glowColor = "rgba(217,169,106,0.08)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -10; // max 5deg
    const rotateY = (x - 0.5) * 10;

    setStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
      boxShadow: `0 12px 40px rgba(0,0,0,0.2), ${(x - 0.5) * 20}px ${(y - 0.5) * 20}px 40px ${glowColor}`,
    });
  };

  const handleLeave = () => {
    setStyle({
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)",
      boxShadow: "none",
    });
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transition: "transform 0.25s ease-out, box-shadow 0.25s ease-out",
        willChange: "transform",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
