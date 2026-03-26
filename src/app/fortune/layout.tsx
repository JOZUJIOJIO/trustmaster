import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BaZi Four Pillars Analysis — AI Personality Reading",
  description:
    "Generate your BaZi Four Pillars chart instantly. AI-powered deep personality analysis across 6 dimensions: personality, career, wealth, love, health, and life guidance. Free chart + paid AI reading.",
  keywords: ["BaZi analysis", "Four Pillars", "八字", "命理分析", "AI personality reading", "五行分析", "birth chart"],
  alternates: { canonical: "/fortune" },
  openGraph: {
    title: "BaZi Four Pillars Analysis — AI Personality Reading",
    description: "Generate your BaZi chart and get AI-powered personality insights based on 3,000 years of Eastern wisdom.",
  },
};

export default function FortuneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
