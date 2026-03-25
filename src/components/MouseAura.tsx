"use client";

import { useEffect, useRef } from "react";

/**
 * Global mouse aura + golden particle trail
 * Fixed canvas overlay, pointer-events: none
 * Desktop only (skipped on touch devices)
 */
export default function MouseAura() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);

  useEffect(() => {
    // Skip on touch-only devices
    if (!window.matchMedia("(hover: hover)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Add to trail
      trailRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trailRef.current.length > 40) trailRef.current.shift();
    };

    window.addEventListener("mousemove", handleMove);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const { x, y } = mouseRef.current;

      if (x > 0 && y > 0) {
        // Aura glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, 100);
        g.addColorStop(0, "rgba(217,169,106,0.07)");
        g.addColorStop(0.5, "rgba(217,169,106,0.02)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 100, 0, Math.PI * 2);
        ctx.fill();
      }

      // Particle trail
      const trail = trailRef.current;
      for (let i = 0; i < trail.length; i++) {
        trail[i].age++;
        const t = trail[i];
        const life = Math.max(0, 1 - t.age / 50);
        if (life <= 0) continue;

        const size = life * 2.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217,169,106,${life * 0.4})`;
        ctx.fill();

        // Glow
        if (life > 0.5) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217,169,106,${life * 0.06})`;
          ctx.fill();
        }
      }

      // Remove dead particles
      trailRef.current = trail.filter(t => t.age < 50);

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
