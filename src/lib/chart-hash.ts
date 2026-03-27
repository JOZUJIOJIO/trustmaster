/**
 * Generate a stable hash string for a BaZi chart, used as cache/order key.
 */
export function getChartHash(chart: Record<string, unknown>): string {
  const p = (pillar: Record<string, string>) =>
    pillar ? `${pillar.stem}-${pillar.branch}` : "";
  return [
    p(chart.yearPillar as Record<string, string>),
    p(chart.monthPillar as Record<string, string>),
    p(chart.dayPillar as Record<string, string>),
    p(chart.hourPillar as Record<string, string>),
    chart.gender,
  ].join("-");
}
