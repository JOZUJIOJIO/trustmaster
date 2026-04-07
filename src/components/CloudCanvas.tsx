"use client";

import { useEffect, useRef } from "react";

interface CloudLayer {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  opacity: number;
  depth: number;    // 0 = far below, 1 = near (passing by)
  drift: number;    // vertical drift
  driftSpeed: number;
  blur: number;
}

export default function CloudCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudsRef = useRef<CloudLayer[]>([]);
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

    // Three layers of clouds — far, mid, near
    const clouds: CloudLayer[] = [];

    // Far layer — massive, very slow, bottom half, faint
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * w * 1.5 - w * 0.25,
        y: h * 0.55 + Math.random() * h * 0.4,
        w: 400 + Math.random() * 500,
        h: 100 + Math.random() * 120,
        speed: 0.05 + Math.random() * 0.1,
        opacity: 0.04 + Math.random() * 0.04,
        depth: 0,
        drift: 0,
        driftSpeed: 0.002 + Math.random() * 0.003,
        blur: 30,
      });
    }

    // Mid layer — medium clouds, moderate speed, middle area
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * w * 1.5 - w * 0.25,
        y: h * 0.35 + Math.random() * h * 0.45,
        w: 250 + Math.random() * 400,
        h: 60 + Math.random() * 100,
        speed: 0.15 + Math.random() * 0.25,
        opacity: 0.06 + Math.random() * 0.06,
        depth: 1,
        drift: 0,
        driftSpeed: 0.004 + Math.random() * 0.005,
        blur: 18,
      });
    }

    // Near layer — close clouds passing by, larger, faster, more opaque
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random() * w * 2 - w * 0.5,
        y: h * 0.5 + Math.random() * h * 0.5,
        w: 500 + Math.random() * 600,
        h: 120 + Math.random() * 180,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.08 + Math.random() * 0.08,
        depth: 2,
        drift: 0,
        driftSpeed: 0.006 + Math.random() * 0.008,
        blur: 10,
      });
    }

    // Wisp clouds — small, fast, at the top (we're above them)
    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * w * 1.5,
        y: Math.random() * h * 0.4,
        w: 80 + Math.random() * 200,
        h: 15 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.4,
        opacity: 0.02 + Math.random() * 0.03,
        depth: 0,
        drift: 0,
        driftSpeed: 0.003 + Math.random() * 0.004,
        blur: 25,
      });
    }

    cloudsRef.current = clouds;

    const drawCloud = (cloud: CloudLayer) => {
      ctx.save();

      // Apply blur via shadow trick (canvas doesn't have native blur per shape)
      ctx.shadowColor = "rgba(255,255,255," + cloud.opacity + ")";
      ctx.shadowBlur = cloud.blur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = "#ffffff";

      const cx = cloud.x;
      const cy = cloud.y + Math.sin(cloud.drift) * (8 + cloud.depth * 4);

      // Build organic cloud shape from overlapping ellipses
      // Main body
      ctx.beginPath();
      ctx.ellipse(cx, cy, cloud.w * 0.5, cloud.h * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left puff
      ctx.beginPath();
      ctx.ellipse(cx - cloud.w * 0.3, cy + cloud.h * 0.05, cloud.w * 0.3, cloud.h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right puff
      ctx.beginPath();
      ctx.ellipse(cx + cloud.w * 0.32, cy + cloud.h * 0.08, cloud.w * 0.28, cloud.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top bump
      ctx.beginPath();
      ctx.ellipse(cx + cloud.w * 0.08, cy - cloud.h * 0.2, cloud.w * 0.22, cloud.h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Far left wisp
      ctx.beginPath();
      ctx.ellipse(cx - cloud.w * 0.48, cy + cloud.h * 0.15, cloud.w * 0.15, cloud.h * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Far right wisp
      ctx.beginPath();
      ctx.ellipse(cx + cloud.w * 0.5, cy + cloud.h * 0.18, cloud.w * 0.12, cloud.h * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time++;

      // Sort by depth for proper layering (far first)
      const sorted = [...cloudsRef.current].sort((a, b) => a.depth - b.depth);

      for (const cloud of sorted) {
        // Move horizontally
        cloud.x += cloud.speed;
        // Gentle vertical drift (breathing motion)
        cloud.drift += cloud.driftSpeed;

        // Wrap around — seamless loop
        if (cloud.x - cloud.w * 0.6 > w) {
          cloud.x = -cloud.w * 0.6;
          // Randomize y slightly on re-entry
          cloud.y += (Math.random() - 0.5) * 40;
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
