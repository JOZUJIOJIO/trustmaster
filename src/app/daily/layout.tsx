import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily BaZi Insights — Personalized Daily Fortune",
  description:
    "Get personalized daily fortune scores based on your BaZi birth chart. Career, wealth, love, and health scores updated daily with auspicious and inauspicious guidance.",
  keywords: ["daily fortune", "daily horoscope", "BaZi daily", "每日运势", "八字运势", "daily insights"],
  alternates: { canonical: "/daily" },
  openGraph: {
    title: "Daily BaZi Insights — Personalized Daily Fortune",
    description: "Personalized daily fortune scores based on your birth chart. Updated every day.",
  },
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
