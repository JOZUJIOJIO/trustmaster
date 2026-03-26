import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compatibility Analysis — Five Elements Love Match",
  description:
    "Analyze relationship compatibility through BaZi Five Elements. Enter two birth dates to see love, career, friendship, and communication compatibility scores.",
  keywords: ["compatibility", "love match", "BaZi compatibility", "合盘", "五行配对", "relationship analysis", "zodiac match"],
  alternates: { canonical: "/compatibility" },
  openGraph: {
    title: "Compatibility Analysis — Five Elements Love Match",
    description: "Enter two birth dates to discover your Five Elements compatibility. Love, career, and communication scores.",
  },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
