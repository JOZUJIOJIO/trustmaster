"use client";

import { useEffect, useState } from "react";

interface RadarChartProps {
  data: { label: string; value: number; color: string; emoji: string }[];
  size?: number;
  maxValue?: number;
}

export default function RadarChart({ data, size = 240, maxValue = 5 }: RadarChartProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const levels = 4;
  const angleStep = (Math.PI * 2) / data.length;
  // Start from top (-PI/2)
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / maxValue) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid lines
  const gridPaths = Array.from({ length: levels }, (_, level) => {
    const r = ((level + 1) / levels) * radius;
    const points = data.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    return `M${points.join("L")}Z`;
  });

  // Axis lines
  const axisLines = data.map((_, i) => {
    const angle = startAngle + i * angleStep;
    return {
      x2: cx + radius * Math.cos(angle),
      y2: cy + radius * Math.sin(angle),
    };
  });

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const v = animated ? d.value : 0;
    const p = getPoint(i, v);
    return `${p.x},${p.y}`;
  });
  const dataPath = `M${dataPoints.join("L")}Z`;

  // Label positions
  const labels = data.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = radius + 28;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
      ...d,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full" style={{ maxWidth: size }}>
      {/* Grid */}
      {gridPaths.map((path, i) => (
        <path
          key={`grid-${i}`}
          d={path}
          fill="none"
          stroke="rgba(217, 175, 120, 0.08)"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={`axis-${i}`}
          x1={cx}
          y1={cy}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(217, 175, 120, 0.1)"
          strokeWidth="0.5"
        />
      ))}

      {/* Data area */}
      <path
        d={dataPath}
        fill="rgba(217, 175, 120, 0.12)"
        stroke="rgba(217, 175, 120, 0.5)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />

      {/* Data points */}
      {data.map((d, i) => {
        const v = animated ? d.value : 0;
        const p = getPoint(i, v);
        return (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill={d.color}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1"
            style={{ transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        );
      })}

      {/* Labels */}
      {labels.map((l, i) => (
        <g key={`label-${i}`}>
          <text
            x={l.x}
            y={l.y - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
          >
            {l.emoji}
          </text>
          <text
            x={l.x}
            y={l.y + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(217, 175, 120, 0.5)"
            fontSize="10"
          >
            {l.label}
          </text>
          <text
            x={l.x}
            y={l.y + 22}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(217, 175, 120, 0.3)"
            fontSize="9"
          >
            {l.value}
          </text>
        </g>
      ))}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="2" fill="rgba(217, 175, 120, 0.3)" />
    </svg>
  );
}
