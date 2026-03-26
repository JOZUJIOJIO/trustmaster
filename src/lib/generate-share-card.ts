"use client";

import type { BaziChart } from "./bazi";

export async function generateShareCard(chart: BaziChart, userName: string) {
  const { default: html2canvas } = await import("html2canvas");

  const container = document.createElement("div");
  container.id = "share-card-render";
  container.style.cssText = "position:fixed;left:-9999px;top:0;width:540px;padding:0;";

  // Radar chart as inline SVG
  const elements = [
    { label: "木", value: chart.fiveElements.木, color: "#22c55e" },
    { label: "火", value: chart.fiveElements.火, color: "#ef4444" },
    { label: "土", value: chart.fiveElements.土, color: "#a3712a" },
    { label: "金", value: chart.fiveElements.金, color: "#f59e0b" },
    { label: "水", value: chart.fiveElements.水, color: "#3b82f6" },
  ];
  const maxVal = Math.max(...elements.map(e => e.value), 3);
  const cx = 100, cy = 100, radius = 70;
  const angleStep = (Math.PI * 2) / 5;
  const startAngle = -Math.PI / 2;

  const gridPaths = [1, 2, 3].map(level => {
    const r = (level / 3) * radius;
    const pts = elements.map((_, i) => {
      const a = startAngle + i * angleStep;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return `<polygon points="${pts.join(" ")}" fill="none" stroke="rgba(217,175,120,0.15)" stroke-width="0.5"/>`;
  }).join("");

  const dataPoints = elements.map((e, i) => {
    const a = startAngle + i * angleStep;
    const r = (e.value / maxVal) * radius;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");

  const dots = elements.map((e, i) => {
    const a = startAngle + i * angleStep;
    const r = (e.value / maxVal) * radius;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return `<circle cx="${x}" cy="${y}" r="3" fill="${e.color}" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>`;
  }).join("");

  const labels = elements.map((e, i) => {
    const a = startAngle + i * angleStep;
    const lr = radius + 20;
    const x = cx + lr * Math.cos(a);
    const y = cx + lr * Math.sin(a);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="rgba(217,175,120,0.6)" font-size="11">${e.label} ${e.value}</text>`;
  }).join("");

  const radarSvg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    ${gridPaths}
    <polygon points="${dataPoints}" fill="rgba(217,175,120,0.15)" stroke="rgba(217,175,120,0.6)" stroke-width="1.5" stroke-linejoin="round"/>
    ${dots}
    ${labels}
  </svg>`;

  // Personality one-liner
  const personality = chart.dayMasterElement === "木" ? "坚韧如木，向阳而生"
    : chart.dayMasterElement === "火" ? "热情似火，光芒万丈"
    : chart.dayMasterElement === "土" ? "厚德载物，稳如磐石"
    : chart.dayMasterElement === "金" ? "果断如金，锋芒毕露"
    : "智慧如水，润物无声";

  container.innerHTML = `
    <div style="width:540px;height:960px;background:linear-gradient(180deg,#0f0c1e 0%,#1a1520 50%,#12101c 100%);color:white;font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;padding:40px 36px;display:flex;flex-direction:column;position:relative;overflow:hidden;">
      <!-- Decorative circles -->
      <div style="position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(217,175,120,0.06),transparent);"></div>
      <div style="position:absolute;bottom:-80px;left:-80px;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.04),transparent);"></div>

      <!-- Header -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:10px;color:rgba(217,175,120,0.4);letter-spacing:4px;margin-bottom:8px;">☸ TRUSTMASTER ☸</div>
        <div style="font-size:28px;font-weight:bold;background:linear-gradient(135deg,#d4a574,#f5d4a0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">个性化人生蓝图</div>
      </div>

      <!-- User info -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:20px;font-weight:bold;color:rgba(255,255,255,0.9);">${userName || "缘主"}</div>
        <div style="font-size:12px;color:rgba(217,175,120,0.4);margin-top:4px;">
          ${chart.solarDate} · ${chart.lunarDate}
        </div>
        <div style="font-size:12px;color:rgba(217,175,120,0.3);margin-top:2px;">
          ${chart.zodiacEmoji} ${chart.zodiacAnimal} · ${chart.westernZodiacSymbol} ${chart.westernZodiac}
        </div>
      </div>

      <!-- Four Pillars -->
      <div style="display:flex;justify-content:center;gap:12px;margin-bottom:20px;">
        ${[
          { label: "年柱", p: chart.yearPillar },
          { label: "月柱", p: chart.monthPillar },
          { label: "日柱", p: chart.dayPillar },
          { label: "时柱", p: chart.hourPillar },
        ].map(({ label, p }) => `
          <div style="text-align:center;width:90px;">
            <div style="font-size:9px;color:rgba(217,175,120,0.3);margin-bottom:4px;">${label}</div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(217,175,120,0.1);border-radius:10px;padding:8px 4px;">
              <div style="font-size:24px;font-weight:bold;color:#d4a574;">${p.stem}</div>
              <div style="width:20px;height:1px;background:rgba(217,175,120,0.15);margin:3px auto;"></div>
              <div style="font-size:24px;font-weight:bold;color:rgba(255,255,255,0.8);">${p.branch}</div>
            </div>
            <div style="font-size:9px;color:rgba(217,175,120,0.2);margin-top:3px;">${p.animal}</div>
          </div>
        `).join("")}
      </div>

      <!-- Day Master + Strength -->
      <div style="display:flex;justify-content:center;align-items:center;gap:16px;margin-bottom:16px;">
        <div style="text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#d4a574;">${chart.dayMaster}</div>
          <div style="font-size:10px;color:rgba(217,175,120,0.4);">${chart.dayMasterElement}命 · ${chart.dayMasterStrength === "strong" ? "身强" : "身弱"}</div>
        </div>
        <div style="width:1px;height:40px;background:rgba(217,175,120,0.1);"></div>
        <div style="text-align:center;">
          <div style="font-size:14px;font-weight:bold;color:#d4a574;">喜 ${chart.luckyElement}</div>
          <div style="font-size:10px;color:rgba(217,175,120,0.4);">忌 ${chart.unluckyElement}</div>
        </div>
      </div>

      <!-- Radar Chart -->
      <div style="text-align:center;margin-bottom:12px;">
        ${radarSvg}
      </div>

      <!-- Personality tagline -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:16px;font-weight:bold;color:rgba(255,255,255,0.7);letter-spacing:2px;">「${personality}」</div>
      </div>

      <!-- Spacer -->
      <div style="flex:1;"></div>

      <!-- Footer -->
      <div style="text-align:center;border-top:1px solid rgba(217,175,120,0.08);padding-top:16px;">
        <div style="font-size:10px;color:rgba(217,175,120,0.25);letter-spacing:2px;">TrustMaster · Ancient Eastern Wisdom × AI</div>
        <div style="font-size:9px;color:rgba(217,175,120,0.15);margin-top:4px;">探索你的命运蓝图 trustmaster.app/fortune</div>
        <div style="font-size:9px;color:rgba(139,92,246,0.25);margin-top:2px;">${(() => { try { const ref = localStorage.getItem("trustmaster_ref_code"); return ref ? `邀请码 ${ref}` : ""; } catch { return ""; } })()}</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      width: 540,
      height: 960,
    });

    // Convert to blob and trigger download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TrustMaster_${userName || "Share"}_${chart.dayMaster}${chart.dayMasterElement}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  } finally {
    document.body.removeChild(container);
  }
}
