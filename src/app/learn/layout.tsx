import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn the Four Pillars Map | Kairós",
  description: "Learn the fundamentals of the Four Pillars Map — Five Elements, Ten Symbols, Day Master, and life cycles explained in 6 minutes.",
  keywords: ["Four Pillars map", "Five Elements explained", "天干地支", "个人图谱", "Eastern philosophy", "Ten Gods", "AI personal insight"],
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn the Four Pillars Map | Kairós",
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
                "name": "What is the Four Pillars Map?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Four Pillars Map is a 3,000-year-old Chinese philosophical framework that uses your birth year, month, day, and hour to create four pillars, each containing a Heavenly Stem and Earthly Branch, forming a personal reflection map."
                }
              },
              {
                "@type": "Question",
                "name": "What are the Five Elements?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Five Elements — Wood, Fire, Earth, Metal, and Water — form the foundation of the Four Pillars Map. They interact through generation and control cycles, revealing strengths, challenges, and behavior patterns."
                }
              },
              {
                "@type": "Question",
                "name": "What is the Day Master?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Day Master is the Heavenly Stem of your Day Pillar and acts as your core reference point. It helps frame temperament, personality traits, and how you relate to the world."
                }
              },
              {
                "@type": "Question",
                "name": "How does AI enhance traditional Four Pillars analysis?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Kairós uses deterministic algorithms to calculate Four Pillars, Five Elements, Ten Symbols, and life cycles. AI then translates this data into personalized, accessible insights for self-reflection."
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
