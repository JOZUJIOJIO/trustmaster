import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn BaZi — Introduction to Four Pillars of Destiny",
  description:
    "Learn the fundamentals of BaZi (Four Pillars of Destiny): Heavenly Stems, Earthly Branches, Five Elements, Ten Gods, and how they shape your personality and life path.",
  keywords: ["learn BaZi", "Four Pillars tutorial", "天干地支", "了解八字", "Five Elements explained", "Ten Gods", "BaZi guide"],
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn BaZi — Introduction to Four Pillars of Destiny",
    description: "Learn the fundamentals of BaZi (Four Pillars of Destiny) and how they shape your personality and life path.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kairós" }],
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
