import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Trends — Personalized AI Insight",
  description:
    "Get personalized daily trend scores, focus windows, relationship cues, and wellbeing reminders based on your personal map.",
  keywords: ["daily insights", "daily trends", "personal map", "AI self reflection", "每日趋势", "个人洞察"],
  alternates: { canonical: "/daily" },
  openGraph: {
    title: "Daily Trends — Personalized AI Insight",
    description: "Personalized daily trend scores and action prompts updated every day.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kairós" }],
  },
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
