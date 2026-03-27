"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize stars
    const starCount = Math.min(50, Math.floor((w * h) / 25000));
    const count = starCount;
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const stars = starsRef.current;
      const mouse = mouseRef.current;

      for (const star of stars) {
        // Update position
        star.x += star.vx;
        star.y += star.vy;
        star.pulse += star.pulseSpeed;

        // Wrap around edges
        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        // Mouse interaction — stars gently repel from cursor
        const dx = star.x - mouse.x;
        const dy = star.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 10000) { // 100 * 100
          const dist = Math.sqrt(distSq); // only calculate sqrt when needed
          const force = (100 - dist) / 100 * 0.5;
          star.vx += (dx / dist) * force * 0.1;
          star.vy += (dy / dist) * force * 0.1;
        }

        // Damping
        star.vx *= 0.99;
        star.vy *= 0.99;

        // Pulsing opacity
        const pulseOpacity = star.opacity + Math.sin(star.pulse) * 0.2;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 175, 120, ${Math.max(0.05, pulseOpacity)})`;
        ctx.fill();

        // Glow
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217, 175, 120, ${pulseOpacity * 0.08})`;
          ctx.fill();
        }
      }

      // Draw connections between nearby stars
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 14400) { // 120 * 120
            const opacity = (1 - distSq / 14400) * 0.12;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(217, 175, 120, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse glow
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        gradient.addColorStop(0, "rgba(217, 175, 120, 0.06)");
        gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.02)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(mouse.x - 200, mouse.y - 200, 400, 400);

        // Connect mouse to nearby stars
        for (const star of stars) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 32400) { // 180 * 180
            const opacity = (1 - distSq / 32400) * 0.2;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(star.x, star.y);
            ctx.strokeStyle = `rgba(217, 175, 120, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
    />
  );
}
