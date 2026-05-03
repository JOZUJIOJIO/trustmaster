import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eastern Personal Map — AI Insight Report",
  description:
    "Generate a cultural personal map with Four Pillars, Five Elements, personality patterns, relationship cues, wellbeing habits, and AI action guidance.",
  keywords: ["personal map", "Four Pillars", "Five Elements", "AI insight report", "self reflection", "五行图谱", "个人洞察"],
  alternates: { canonical: "/fortune" },
  openGraph: {
    title: "Eastern Personal Map — AI Insight Report",
    description: "Generate a cultural personal map and get AI-powered reflection prompts.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kairós" }],
  },
};

export default function FortuneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
