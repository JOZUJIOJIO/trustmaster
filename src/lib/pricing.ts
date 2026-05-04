export type KairosProductId = "fortune_pro" | "fortune_master" | "health_report";

export type KairosProductPrice = {
  usdCents: number;
  stars: number;
};

export const kairosPrices: Record<KairosProductId, KairosProductPrice> = {
  health_report: { usdCents: 490, stars: 29 },
  fortune_pro: { usdCents: 990, stars: 99 },
  fortune_master: { usdCents: 2990, stars: 399 },
};

export function formatUsdPrice(productId: KairosProductId) {
  return `$${(kairosPrices[productId].usdCents / 100).toFixed(2)}`;
}

export function formatStarsPrice(productId: KairosProductId) {
  return `${kairosPrices[productId].stars} ★`;
}
