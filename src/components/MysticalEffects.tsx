"use client";

import { useEffect, useRef, useState } from "react";

// ===== Floating Particles =====
export function Particles({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 3,
    duration: 8 + Math.random() * 15,
    delay: Math.random() * 10,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ===== Cursor Light Effect =====
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.left = `${e.clientX}px`;
        ref.current.style.top = `${e.clientY}px`;
        ref.current.style.opacity = "1";
      }
    };
    const handleLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return <div ref={ref} className="cursor-light hidden lg:block" style={{ opacity: 0 }} />;
}

// ===== Scroll Reveal Hook =====
export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ===== Typewriter Text =====
export function TypewriterText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="inline-block w-0.5 h-[1em] bg-amber-400/60 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

// ===== Breathing Glow Ring =====
export function GlowRing({ size = 200, color = "rgba(217, 119, 6, 0.15)" }: { size?: number; color?: string }) {
  return (
    <div
      className="absolute rounded-full animate-breathe pointer-events-none"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        border: `1px solid ${color}`,
        boxShadow: `0 0 40px ${color}, inset 0 0 40px ${color}`,
      }}
    />
  );
}

// ===== Animated Counter =====
export function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{current}</>;
}
