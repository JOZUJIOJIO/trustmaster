"use client";

import { useEffect, useRef } from "react";

interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  opacity: number;
}

export default function CloudCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudsRef = useRef<Cloud[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate clouds
    const count = Math.min(12, Math.floor(w / 120));
    cloudsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.7 + h * 0.1,
      w: 150 + Math.random() * 250,
      h: 40 + Math.random() * 60,
      speed: 0.1 + Math.random() * 0.3,
      opacity: 0.03 + Math.random() * 0.06,
    }));

    const drawCloud = (cloud: Cloud) => {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = "#ffffff";

      // Soft elliptical cloud shape — multiple overlapping ellipses
      const cx = cloud.x;
      const cy = cloud.y;

      ctx.beginPath();
      ctx.ellipse(cx, cy, cloud.w * 0.5, cloud.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx - cloud.w * 0.25, cy + cloud.h * 0.1, cloud.w * 0.35, cloud.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + cloud.w * 0.3, cy + cloud.h * 0.05, cloud.w * 0.3, cloud.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + cloud.w * 0.1, cy - cloud.h * 0.15, cloud.w * 0.25, cloud.h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      for (const cloud of cloudsRef.current) {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.w > w) {
          cloud.x = -cloud.w;
          cloud.y = Math.random() * h * 0.7 + h * 0.1;
        }
        drawCloud(cloud);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
    />
  );
}
