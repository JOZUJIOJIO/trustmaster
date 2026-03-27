import type { Metadata } from "next";

const STEM_META: Record<string, { title: string; desc: string }> = {
  甲: { title: "甲木 (Jia Wood) Personality", desc: "甲木 Day Master: Like a towering tree — leadership, ambition, and growth. Discover your career, love, and life path." },
  乙: { title: "乙木 (Yi Wood) Personality", desc: "乙木 Day Master: Like a vine — flexible, artistic, and resilient. Explore your unique personality blueprint." },
  丙: { title: "丙火 (Bing Fire) Personality", desc: "丙火 Day Master: Like the sun — charismatic, warm, and illuminating. Discover your natural strengths." },
  丁: { title: "丁火 (Ding Fire) Personality", desc: "丁火 Day Master: Like candlelight — insightful, warm, and focused. Explore your inner world." },
  戊: { title: "戊土 (Wu Earth) Personality", desc: "戊土 Day Master: Like a mountain — reliable, grounding, and steady. Your personality analysis." },
  己: { title: "己土 (Ji Earth) Personality", desc: "己土 Day Master: Like fertile soil — nurturing, inclusive, and patient. Discover your strengths." },
  庚: { title: "庚金 (Geng Metal) Personality", desc: "庚金 Day Master: Like a sword — decisive, principled, and strong. Your personality blueprint." },
  辛: { title: "辛金 (Xin Metal) Personality", desc: "辛金 Day Master: Like a jewel — refined, elegant, and precise. Explore your unique traits." },
  壬: { title: "壬水 (Ren Water) Personality", desc: "壬水 Day Master: Like the ocean — wise, deep, and ambitious. Your personality analysis." },
  癸: { title: "癸水 (Gui Water) Personality", desc: "癸水 Day Master: Like morning dew — intuitive, gentle, and perceptive. Discover your path." },
};

export async function generateMetadata({ params }: { params: Promise<{ stem: string }> }): Promise<Metadata> {
  const { stem } = await params;
  const decoded = decodeURIComponent(stem);
  const meta = STEM_META[decoded];

  if (!meta) {
    return { title: "BaZi Personality Analysis" };
  }

  return {
    title: meta.title,
    description: meta.desc,
    keywords: [`${decoded} Day Master`, "BaZi personality", `${decoded}木 性格`, "Four Pillars", "八字性格分析"],
    alternates: { canonical: `/personality/${encodeURIComponent(decoded)}` },
    openGraph: {
      title: meta.title,
      description: meta.desc,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kairós" }],
    },
  };
}

export default function PersonalityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
