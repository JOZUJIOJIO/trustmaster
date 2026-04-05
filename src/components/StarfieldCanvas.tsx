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
  layer: number; // 0 = far/dim, 1 = mid, 2 = near/bright
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
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

    // Initialize stars — three layers for depth
    const totalStars = Math.min(200, Math.floor((w * h) / 8000));
    starsRef.current = Array.from({ length: totalStars }, () => {
      const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.6 ? 1 : 2;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (0.1 + layer * 0.15),
        vy: (Math.random() - 0.5) * (0.1 + layer * 0.15),
        size: layer === 0 ? 0.5 + Math.random() * 0.8 : layer === 1 ? 1 + Math.random() * 1.5 : 1.5 + Math.random() * 2.5,
        opacity: layer === 0 ? 0.15 + Math.random() * 0.2 : layer === 1 ? 0.3 + Math.random() * 0.35 : 0.5 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.025,
        layer,
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    let frameCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const stars = starsRef.current;
      const mouse = mouseRef.current;
      frameCount++;

      // Spawn shooting star occasionally
      if (Math.random() < 0.003 && shootingRef.current.length < 2) {
        const startX = Math.random() * w * 0.8;
        const angle = Math.PI / 6 + Math.random() * Math.PI / 6; // 30-60 degrees
        shootingRef.current.push({
          x: startX,
          y: -10,
          vx: Math.cos(angle) * (4 + Math.random() * 4),
          vy: Math.sin(angle) * (4 + Math.random() * 4),
          life: 0,
          maxLife: 40 + Math.random() * 30,
          size: 1 + Math.random() * 1.5,
        });
      }

      // Draw & update shooting stars
      for (let i = shootingRef.current.length - 1; i >= 0; i--) {
        const s = shootingRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;

        // Trail
        const tailLen = 30;
        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x - s.vx * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5,
          s.y - s.vy * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5
        );
        grad.addColorStop(0, `rgba(255, 230, 180, ${alpha * 0.8})`);
        grad.addColorStop(1, `rgba(255, 230, 180, 0)`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.vx * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5,
          s.y - s.vy * tailLen / Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.5
        );
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha * 0.4})`;
        ctx.fill();

        if (s.life >= s.maxLife || s.x > w + 50 || s.y > h + 50) {
          shootingRef.current.splice(i, 1);
        }
      }

      // Draw stars by layer (far first, near last)
      for (let layer = 0; layer <= 2; layer++) {
        for (const star of stars) {
          if (star.layer !== layer) continue;

          // Update position
          star.x += star.vx;
          star.y += star.vy;
          star.pulse += star.pulseSpeed;

          // Wrap around edges
          if (star.x < -10) star.x = w + 10;
          if (star.x > w + 10) star.x = -10;
          if (star.y < -10) star.y = h + 10;
          if (star.y > h + 10) star.y = -10;

          // Mouse interaction — only mid and near stars react
          if (star.layer >= 1) {
            const dx = star.x - mouse.x;
            const dy = star.y - mouse.y;
            const distSq = dx * dx + dy * dy;
            const interactRange = star.layer === 2 ? 15000 : 10000;
            if (distSq < interactRange) {
              const dist = Math.sqrt(distSq);
              const force = (Math.sqrt(interactRange) - dist) / Math.sqrt(interactRange) * 0.5;
              star.vx += (dx / dist) * force * 0.1;
              star.vy += (dy / dist) * force * 0.1;
            }
          }

          // Damping
          star.vx *= 0.99;
          star.vy *= 0.99;

          // Pulsing opacity — stronger for bright stars
          const pulseAmp = star.layer === 2 ? 0.25 : star.layer === 1 ? 0.15 : 0.08;
          const pulseOpacity = star.opacity + Math.sin(star.pulse) * pulseAmp;

          // Star color — slight variation
          const warmth = star.layer === 2 ? 1 : star.layer === 1 ? 0.7 : 0.4;
          const r = Math.round(200 + 55 * warmth);
          const g = Math.round(160 + 40 * warmth);
          const b = Math.round(100 + 30 * warmth);

          // Draw star core
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.05, pulseOpacity)})`;
          ctx.fill();

          // Cross-shaped diffraction spikes for bright stars
          if (star.layer === 2 && star.size > 2) {
            const spikeLen = star.size * 4;
            const spikeAlpha = pulseOpacity * 0.15;
            ctx.beginPath();
            ctx.moveTo(star.x - spikeLen, star.y);
            ctx.lineTo(star.x + spikeLen, star.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${spikeAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(star.x, star.y - spikeLen);
            ctx.lineTo(star.x, star.y + spikeLen);
            ctx.stroke();
          }

          // Glow halo
          if (star.size > 1) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * (star.layer === 2 ? 5 : 3), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseOpacity * (star.layer === 2 ? 0.06 : 0.04)})`;
            ctx.fill();
          }
        }
      }

      // Draw connections between nearby mid/near stars
      const connectStars = stars.filter(s => s.layer >= 1);
      for (let i = 0; i < connectStars.length; i++) {
        for (let j = i + 1; j < connectStars.length; j++) {
          const dx = connectStars[i].x - connectStars[j].x;
          const dy = connectStars[i].y - connectStars[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 18000) {
            const opacity = (1 - distSq / 18000) * 0.08;
            ctx.beginPath();
            ctx.moveTo(connectStars[i].x, connectStars[i].y);
            ctx.lineTo(connectStars[j].x, connectStars[j].y);
            ctx.strokeStyle = `rgba(217, 175, 120, ${opacity})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      }

      // Mouse glow
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
        gradient.addColorStop(0, "rgba(217, 175, 120, 0.05)");
        gradient.addColorStop(0.3, "rgba(139, 92, 246, 0.02)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(mouse.x - 250, mouse.y - 250, 500, 500);

        // Connect mouse to nearby stars
        for (const star of connectStars) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 40000) {
            const opacity = (1 - distSq / 40000) * 0.15;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(star.x, star.y);
            ctx.strokeStyle = `rgba(217, 175, 120, ${opacity})`;
            ctx.lineWidth = 0.4;
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
