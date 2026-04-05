"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rotating Taiji (太极) with Bagua trigrams ring
 * Follows mouse with subtle parallax tilt
 */
export default function TaijiSvg({ size = 200 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      setTilt({ x: dy * 8, y: -dx * 8 }); // subtle tilt
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const half = size / 2;
  const outerR = half - 4;
  const innerR = half * 0.5;
  const dotR = half * 0.06;

  const trigrams = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];

  // Round to avoid SSR/client hydration mismatch from floating-point precision differences
  const r = (n: number) => Math.round(n * 1000) / 1000;

  return (
    <div
      className="relative"
      style={{
        perspective: "600px",
        width: size,
        height: size,
      }}
    >
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_0_40px_rgba(217,169,106,0.15)]"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        <defs>
          <filter id="taiji-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(217,169,106,0.4)" />
            <stop offset="100%" stopColor="rgba(217,169,106,0.15)" />
          </linearGradient>
        </defs>

        {/* Outer ring — rotating slowly */}
        <g style={{ transformOrigin: `${half}px ${half}px` }}>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="120s" repeatCount="indefinite" />
          <circle cx={half} cy={half} r={outerR} fill="none" stroke="rgba(217,169,106,0.1)" strokeWidth="0.5" />
          <circle cx={half} cy={half} r={outerR - 8} fill="none" stroke="rgba(217,169,106,0.06)" strokeWidth="0.5" />

          {/* Bagua trigrams around the ring */}
          {trigrams.map((t, i) => {
            const angle = ((i * 45) - 90) * (Math.PI / 180);
            const tr = outerR - 4;
            const x = r(half + tr * Math.cos(angle));
            const y = r(half + tr * Math.sin(angle));
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(217,169,106,0.15)"
                fontSize={size * 0.06}
              >
                {t}
              </text>
            );
          })}

          {/* Tick marks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 - 90) * (Math.PI / 180);
            const r1 = outerR - 14;
            const r2 = outerR - (i % 3 === 0 ? 20 : 17);
            return (
              <line
                key={i}
                x1={r(half + r1 * Math.cos(angle))}
                y1={r(half + r1 * Math.sin(angle))}
                x2={r(half + r2 * Math.cos(angle))}
                y2={r(half + r2 * Math.sin(angle))}
                stroke={`rgba(217,169,106,${i % 3 === 0 ? 0.12 : 0.06})`}
                strokeWidth={i % 3 === 0 ? 1 : 0.5}
              />
            );
          })}
        </g>

        {/* Inner Taiji — counter-rotating */}
        <g style={{ transformOrigin: `${half}px ${half}px` }}>
          <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="60s" repeatCount="indefinite" />

          {/* Yin-yang circle */}
          <circle cx={half} cy={half} r={innerR} fill="none" stroke="url(#goldGrad)" strokeWidth="1" filter="url(#taiji-glow)" />

          {/* Yang (bright) half */}
          <path
            d={`M${half} ${half - innerR} A${innerR / 2} ${innerR / 2} 0 0 1 ${half} ${half} A${innerR / 2} ${innerR / 2} 0 0 0 ${half} ${half + innerR} A${innerR} ${innerR} 0 0 1 ${half} ${half - innerR}`}
            fill="rgba(217,169,106,0.12)"
          />
          {/* Yin (dark) half */}
          <path
            d={`M${half} ${half - innerR} A${innerR / 2} ${innerR / 2} 0 0 0 ${half} ${half} A${innerR / 2} ${innerR / 2} 0 0 1 ${half} ${half + innerR} A${innerR} ${innerR} 0 0 0 ${half} ${half - innerR}`}
            fill="rgba(217,169,106,0.04)"
          />

          {/* Dots */}
          <circle cx={half} cy={half - innerR / 2} r={dotR} fill="rgba(217,169,106,0.06)" />
          <circle cx={half} cy={half + innerR / 2} r={dotR} fill="rgba(217,169,106,0.2)">
            <animate attributeName="opacity" values="0.15;0.3;0.15" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
