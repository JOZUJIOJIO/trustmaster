import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn BaZi — Understanding Four Pillars | Kairós",
  description: "Learn the fundamentals of BaZi (Four Pillars of Destiny) — Five Elements, Ten Gods, Day Master, and Luck Cycles explained in 6 minutes.",
  keywords: ["learn BaZi", "Four Pillars tutorial", "天干地支", "了解八字", "Five Elements explained", "Ten Gods", "BaZi guide"],
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn BaZi — Understanding Four Pillars | Kairós",
    description: "3,000 years of Eastern wisdom, explained in 6 minutes.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is BaZi (Four Pillars of Destiny)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "BaZi is a 3,000-year-old Chinese metaphysical system that uses your birth year, month, day, and hour to create four pillars, each containing a Heavenly Stem and Earthly Branch, forming your unique energy blueprint."
                }
              },
              {
                "@type": "Question",
                "name": "What are the Five Elements in BaZi?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Five Elements — Wood, Fire, Earth, Metal, and Water — form the foundation of BaZi. They interact through generation (nurture) and control (restraint) cycles, revealing your strengths, challenges, and life patterns."
                }
              },
              {
                "@type": "Question",
                "name": "What is the Day Master?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Day Master is the Heavenly Stem of your Day Pillar and represents your core self. It determines your fundamental nature, personality traits, and how you relate to the world."
                }
              },
              {
                "@type": "Question",
                "name": "How does AI enhance traditional BaZi analysis?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Kairós uses deterministic algorithms to calculate your Four Pillars, Five Elements, Ten Gods, and Luck Cycles with 100% accuracy. AI then interprets this data into personalized, accessible insights bridging ancient wisdom with modern understanding."
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
