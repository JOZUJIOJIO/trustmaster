"use client";

import type { BaziChart } from "./bazi";

export async function generateBaziPDF(
  chart: BaziChart,
  aiReading: Record<string, string> | null,
  userName: string
) {
  // Dynamic imports for client-side only
  const { default: jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  // Create a hidden container for the PDF content
  const container = document.createElement("div");
  container.id = "pdf-render";
  container.style.cssText = "position:fixed;left:-9999px;top:0;width:595px;padding:0;background:white;";

  const elementBars = (["木", "火", "土", "金", "水"] as const).map((el) => {
    const count = chart.fiveElements[el];
    const max = Math.max(...Object.values(chart.fiveElements));
    const pct = max > 0 ? (count / max) * 100 : 0;
    const strength = count >= 3 ? "旺" : count >= 2 ? "中" : "弱";
    const colors: Record<string, string> = { 木: "#22c55e", 火: "#ef4444", 土: "#a3712a", 金: "#f59e0b", 水: "#3b82f6" };
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <span style="width:24px;font-size:13px;">${el}</span>
      <div style="flex:1;height:10px;background:#f3f4f6;border-radius:5px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${colors[el]};border-radius:5px;"></div>
      </div>
      <span style="font-size:11px;color:#888;width:50px;text-align:right;">${count} (${strength})</span>
    </div>`;
  }).join("");

  const readingCards = aiReading && !aiReading.error ? [
    { icon: "🧠", title: "性格特质", key: "personality" },
    { icon: "💼", title: "事业运势", key: "career" },
    { icon: "💰", title: "财运分析", key: "wealth" },
    { icon: "❤️", title: "感情运势", key: "love" },
    { icon: "🏥", title: "健康提醒", key: "health" },
    { icon: "🍀", title: "开运指南", key: "advice" },
  ].filter((c) => aiReading[c.key]).map((c) => `
    <div style="background:#fefbf6;border:1px solid #e8d5b8;border-radius:10px;padding:14px;margin-bottom:10px;page-break-inside:avoid;">
      <div style="font-weight:bold;font-size:13px;color:#92400e;margin-bottom:6px;">${c.icon} ${c.title}</div>
      <div style="font-size:11px;color:#444;line-height:1.7;">${aiReading[c.key]}</div>
    </div>
  `).join("") : "";

  container.innerHTML = `
    <div style="font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#1a1a1a;padding:40px 35px;">
      <!-- Header -->
      <div style="text-align:center;border-bottom:2px solid #b45309;padding-bottom:20px;margin-bottom:24px;">
        <div style="font-size:11px;color:#999;letter-spacing:4px;margin-bottom:6px;">☸ TRUSTMASTER ☸</div>
        <div style="font-size:26px;font-weight:bold;color:#92400e;">个性化人生蓝图分析</div>
        <div style="font-size:12px;color:#888;margin-top:8px;">Personalized Life Blueprint Analysis</div>
      </div>

      <!-- User Info -->
      <div style="background:#fefbf6;border:1px solid #e8d5b8;border-radius:10px;padding:16px;margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div><span style="color:#888;font-size:11px;">姓名：</span><span style="font-weight:bold;font-size:13px;">${userName || "未填写"}</span></div>
          <div><span style="color:#888;font-size:11px;">性别：</span><span style="font-size:13px;">${chart.gender === "male" ? "男" : "女"}</span></div>
          <div><span style="color:#888;font-size:11px;">公历：</span><span style="font-size:13px;">${chart.solarDate}</span></div>
          <div><span style="color:#888;font-size:11px;">农历：</span><span style="font-size:13px;">${chart.lunarDate}</span></div>
          <div><span style="color:#888;font-size:11px;">时辰：</span><span style="font-size:13px;">${chart.birthHour}</span></div>
          <div><span style="color:#888;font-size:11px;">生肖：</span><span style="font-size:13px;">${chart.zodiacEmoji} ${chart.zodiacAnimal}</span></div>
          <div><span style="color:#888;font-size:11px;">星座：</span><span style="font-size:13px;">${chart.westernZodiacSymbol} ${chart.westernZodiac}</span></div>
        </div>
      </div>

      <!-- Four Pillars -->
      <div style="margin-bottom:18px;">
        <div style="text-align:center;font-size:12px;color:#b45309;letter-spacing:6px;margin-bottom:12px;">四 柱 八 字</div>
        <div style="display:flex;justify-content:center;gap:12px;">
          ${[
            { label: "年柱", p: chart.yearPillar },
            { label: "月柱", p: chart.monthPillar },
            { label: "日柱", p: chart.dayPillar },
            { label: "时柱", p: chart.hourPillar },
          ].map(({ label, p }) => `
            <div style="text-align:center;width:100px;">
              <div style="font-size:10px;color:#999;margin-bottom:6px;">${label}</div>
              <div style="background:#fefbf6;border:1px solid #e8d5b8;border-radius:8px;padding:10px 6px;">
                <div style="font-size:22px;font-weight:bold;color:#b45309;">${p.stem}</div>
                <div style="font-size:10px;color:#999;">${p.stemElement}</div>
                <div style="width:30px;height:1px;background:#e8d5b8;margin:4px auto;"></div>
                <div style="font-size:22px;font-weight:bold;color:#333;">${p.branch}</div>
                <div style="font-size:10px;color:#999;">${p.branchElement}</div>
              </div>
              <div style="font-size:10px;color:#bbb;margin-top:3px;">${p.animal}</div>
            </div>
          `).join("")}
        </div>
        <div style="text-align:center;margin-top:10px;font-size:12px;">
          <span style="color:#888;">日主：</span><span style="font-weight:bold;color:#b45309;">${chart.dayMaster}${chart.dayMasterElement}</span>
          <span style="margin-left:16px;color:#888;">喜用神：</span><span style="font-weight:bold;color:#b45309;">${chart.luckyElement}</span>
        </div>
      </div>

      <!-- Five Elements -->
      <div style="margin-bottom:18px;">
        <div style="text-align:center;font-size:12px;color:#b45309;letter-spacing:6px;margin-bottom:12px;">五 行 分 布</div>
        <div style="padding:0 20px;">${elementBars}</div>
      </div>

      ${readingCards ? `
        <!-- AI Reading -->
        <div style="margin-bottom:18px;">
          <div style="text-align:center;font-size:12px;color:#b45309;letter-spacing:6px;margin-bottom:12px;">✨ AI 深度解读</div>
          ${readingCards}
        </div>
      ` : ""}

      <!-- Footer -->
      <div style="text-align:center;border-top:1px solid #eee;padding-top:16px;margin-top:24px;">
        <div style="font-size:10px;color:#bbb;">本报告由 Kairós 八字命理引擎生成</div>
        <div style="font-size:9px;color:#ddd;margin-top:4px;">仅供参考，不作为重要决策依据 · ${new Date().toLocaleDateString("zh-CN")}</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgWidth = 595.28; // A4 width in points
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 841.89; // A4 height in points

    const pdf = new jsPDF("p", "pt", "a4");

    // Handle multi-page
    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `Kairós_Analysis_${userName || "Report"}_${chart.solarDate.replace(/[年月]/g, "-").replace("日", "")}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}
