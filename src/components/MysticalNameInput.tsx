"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Mystical name input — characters appear with golden particle convergence
 * Each typed character triggers particles that converge to form it
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  charIndex: number;
}

let particleId = 0;

export default function MysticalNameInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLen = useRef(0);

  useEffect(() => {
    const newLen = value.length;
    // New character typed — spawn particles
    if (newLen > prevLen.current) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: ++particleId,
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 120,
          charIndex: newLen - 1,
        });
      }
      setParticles(prev => [...prev, ...newParticles]);
      // Remove particles after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      }, 800);
    }
    prevLen.current = newLen;
  }, [value]);

  return (
    <div
      className="relative flex flex-col items-center cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Display area — characters with shimmer */}
      <div className="relative min-h-[60px] flex items-center justify-center mb-4">
        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: `calc(50% + ${p.charIndex * 28 - (value.length - 1) * 14}px)`,
              top: "50%",
              background: "rgba(217,169,106,0.6)",
              boxShadow: "0 0 6px rgba(217,169,106,0.4)",
              animation: "particleConverge 0.7s ease-out forwards",
              // @ts-expect-error CSS custom properties
              "--px": `${p.x}px`,
              "--py": `${p.y}px`,
            }}
          />
        ))}

        {/* Characters */}
        <div className="flex items-center gap-1 relative z-10">
          {value.split("").map((char, i) => (
            <span
              key={`${i}-${char}`}
              className="text-3xl font-bold text-gradient-shimmer inline-block"
              style={{
                animation: "dropIn 0.5s ease-out both",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {char}
            </span>
          ))}
          {/* Blinking cursor */}
          {focused && (
            <span className="w-0.5 h-8 bg-amber-400/60 inline-block animate-pulse ml-0.5" />
          )}
        </div>

        {/* Empty state — mystical placeholder */}
        {!value && !focused && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-amber-200/15 text-lg tracking-widest">{placeholder}</span>
          </div>
        )}
      </div>

      {/* Decorative underline */}
      <div className="relative w-full max-w-xs">
        <div className="h-px bg-amber-400/10 w-full" />
        <div
          className="absolute top-0 h-px bg-amber-400/40 transition-all duration-500"
          style={{ width: focused ? "100%" : "0%", left: focused ? "0%" : "50%" }}
        />
        {/* Glow dot at center */}
        {focused && (
          <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400/60 animate-pulse" />
        )}
      </div>

      {/* Hidden actual input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="sr-only"
        maxLength={10}
        autoComplete="off"
      />
    </div>
  );
}
