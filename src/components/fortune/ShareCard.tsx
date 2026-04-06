"use client";

import { useCallback } from "react";
import { ELEMENT_COLORS, ELEMENT_EMOJI, type BaziChart } from "@/lib/bazi";

interface ShareCardProps {
  chart: BaziChart;
  userName?: string;
  isChinese: boolean;
}

export function ShareCard({ chart, userName, isChinese }: ShareCardProps) {
  const generateImage = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const w = 1080;
    const h = 1440;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#0a0814";
    ctx.fillRect(0, 0, w, h);

    // Subtle gradient overlay
    const grad = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w * 0.8);
    grad.addColorStop(0, "rgba(60,20,120,0.15)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Helper
    const text = (str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "center") => {
      ctx.font = `${size}px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(str, x, y);
    };

    const boldText = (str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "center") => {
      ctx.font = `bold ${size}px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(str, x, y);
    };

    // Top decorative line
    ctx.strokeStyle = "rgba(217,169,106,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, 100);
    ctx.lineTo(w * 0.7, 100);
    ctx.stroke();

    // Brand
    text("KAIRÓS", w / 2, 80, 24, "rgba(217,169,106,0.4)");

    // Zodiac emoji large
    boldText(chart.zodiacEmoji, w / 2, 220, 80, "rgba(255,255,255,0.9)");

    // Name
    if (userName && userName !== "缘主") {
      boldText(userName, w / 2, 300, 42, "rgba(255,230,180,0.9)");
    }

    // Date info
    text(chart.solarDate, w / 2, 350, 22, "rgba(217,169,106,0.5)");
    text(`${chart.lunarDate} · ${chart.birthHour}`, w / 2, 385, 18, "rgba(217,169,106,0.35)");

    // Divider
    ctx.strokeStyle = "rgba(217,169,106,0.15)";
    ctx.beginPath();
    ctx.moveTo(w * 0.2, 430);
    ctx.lineTo(w * 0.8, 430);
    ctx.stroke();

    // Day Master — big
    boldText(chart.dayMaster, w / 2, 530, 120, "rgba(255,230,180,0.95)");
    text(
      `${chart.dayMasterElement}${isChinese ? "命" : ""} · ${chart.dayMasterStrength === "strong" ? (isChinese ? "身强" : "Strong") : (isChinese ? "身弱" : "Gentle")}`,
      w / 2, 580, 24, "rgba(217,169,106,0.6)"
    );

    // Personality
    ctx.font = `20px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif`;
    ctx.fillStyle = "rgba(255,230,180,0.5)";
    ctx.textAlign = "center";
    const desc = isChinese ? chart.dayMasterDesc : chart.dayMasterDescEn;
    // Word wrap
    const maxWidth = w * 0.7;
    const words = desc.split("");
    let line = "";
    let lineY = 640;
    for (const char of words) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(line, w / 2, lineY);
        line = char;
        lineY += 32;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, w / 2, lineY);

    // Four Pillars
    const pillars = [
      { label: isChinese ? "年柱" : "Year", stem: chart.yearPillar.stem, branch: chart.yearPillar.branch },
      { label: isChinese ? "月柱" : "Month", stem: chart.monthPillar.stem, branch: chart.monthPillar.branch },
      { label: isChinese ? "日柱" : "Day", stem: chart.dayPillar.stem, branch: chart.dayPillar.branch },
      { label: isChinese ? "时柱" : "Hour", stem: chart.hourPillar.stem, branch: chart.hourPillar.branch },
    ];
    const pillarY = 780;
    const pillarSpacing = w / 5;
    pillars.forEach((p, i) => {
      const px = pillarSpacing * (i + 1);
      text(p.label, px, pillarY, 14, "rgba(217,169,106,0.35)");
      boldText(p.stem, px, pillarY + 50, 36, "rgba(255,230,180,0.8)");
      boldText(p.branch, px, pillarY + 95, 36, "rgba(255,230,180,0.6)");
    });

    // Five Elements bar
    const barY = 960;
    const barH = 16;
    const barX = w * 0.1;
    const barW = w * 0.8;
    const total = Object.values(chart.fiveElements).reduce((a, b) => a + b, 0);
    let offsetX = barX;

    // Rounded rect clip
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 8);
    ctx.clip();

    (["木", "火", "土", "金", "水"] as const).forEach((el) => {
      const pct = total > 0 ? chart.fiveElements[el] / total : 0.2;
      const elW = barW * pct;
      ctx.fillStyle = ELEMENT_COLORS[el] + "cc";
      ctx.fillRect(offsetX, barY, elW, barH);
      offsetX += elW;
    });

    ctx.restore();

    // Element labels
    const elLabelY = barY + 45;
    (["木", "火", "土", "金", "水"] as const).forEach((el, i) => {
      const lx = barX + barW * (i / 5) + barW * 0.1;
      text(`${el} ${chart.fiveElements[el]}`, lx, elLabelY, 16, "rgba(217,169,106,0.4)");
    });

    // Lucky element
    text(
      isChinese ? `喜用神：${chart.luckyElement}` : `Lucky Element: ${chart.luckyElement}`,
      w / 2, 1060, 20, "rgba(217,169,106,0.5)"
    );

    // Zodiac info
    text(
      `${chart.zodiacEmoji} ${chart.zodiacAnimal} · ${chart.westernZodiacSymbol} ${chart.westernZodiac}`,
      w / 2, 1100, 18, "rgba(217,169,106,0.35)"
    );

    // Bottom divider
    ctx.strokeStyle = "rgba(217,169,106,0.1)";
    ctx.beginPath();
    ctx.moveTo(w * 0.15, 1160);
    ctx.lineTo(w * 0.85, 1160);
    ctx.stroke();

    // Watermark
    boldText("KAIRÓS", w / 2, 1220, 28, "rgba(217,169,106,0.3)");
    text(
      isChinese ? "探索五千年东方智慧 · kairos.app" : "Ancient Eastern Wisdom × AI · kairos.app",
      w / 2, 1260, 16, "rgba(217,169,106,0.2)"
    );

    // CTA
    ctx.fillStyle = "rgba(217,169,106,0.08)";
    ctx.beginPath();
    ctx.roundRect(w * 0.25, 1300, w * 0.5, 50, 25);
    ctx.fill();
    text(
      isChinese ? "扫码查看你的命盘" : "Scan to get your reading",
      w / 2, 1332, 18, "rgba(217,169,106,0.4)"
    );

    // Export
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);

      // Try native share first (mobile)
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], "kairos-chart.png", { type: "image/png" })] })) {
        navigator.share({
          files: [new File([blob], "kairos-chart.png", { type: "image/png" })],
          title: "My Kairós Chart",
        }).catch(() => {
          // Fallback to download
          downloadImage(url);
        });
      } else {
        downloadImage(url);
      }
    }, "image/png");
  }, [chart, userName, isChinese]);

  return (
    <button
      onClick={generateImage}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-amber-400/15 hover:bg-white/[0.08] transition-colors text-sm text-amber-200/60 hover:text-amber-200 cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      {isChinese ? "分享命盘" : "Share Chart"}
    </button>
  );
}

function downloadImage(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "kairos-chart.png";
  a.click();
  URL.revokeObjectURL(url);
}
