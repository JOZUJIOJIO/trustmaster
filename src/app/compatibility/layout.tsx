import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compatibility Analysis — Five Elements Love Match",
  description:
    "Analyze relationship compatibility through Five Elements. Enter two birth dates to see relationship, work style, friendship, and communication scores.",
  keywords: ["compatibility", "relationship match", "Five Elements compatibility", "合盘", "五行配对", "relationship analysis", "zodiac match"],
  alternates: { canonical: "/compatibility" },
  openGraph: {
    title: "Compatibility Analysis — Five Elements Love Match",
    description: "Enter two birth dates to discover your Five Elements compatibility. Relationship, work style, and communication scores.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kairós" }],
  },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
