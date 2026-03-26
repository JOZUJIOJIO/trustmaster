import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn BaZi — Introduction to Four Pillars of Destiny",
  description:
    "Learn the fundamentals of BaZi (Four Pillars of Destiny): Heavenly Stems, Earthly Branches, Five Elements, Ten Gods, and how they shape your personality and life path.",
  keywords: ["learn BaZi", "Four Pillars tutorial", "天干地支", "了解八字", "Five Elements explained", "Ten Gods", "BaZi guide"],
  alternates: { canonical: "/learn" },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
