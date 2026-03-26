import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { Analytics } from "@vercel/analytics/react";
import MouseAura from "@/components/MouseAura";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const chineseSerif = Noto_Serif_SC({
  variable: "--font-chinese",
  weight: ["400", "600", "700"],
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Kairós | AI-Powered BaZi & Eastern Personality Analysis",
    template: "%s | Kairós",
  },
  description:
    "Discover personalized life insights through ancient Eastern philosophical frameworks powered by AI. BaZi Four Pillars personality analysis, Five Elements balance, and cultural wellness guidance.",
  keywords: ["BaZi", "Four Pillars analysis", "personality insights", "five elements", "Eastern philosophy", "AI life analysis", "self-discovery", "cultural wellness", "八字", "命理", "四柱", "五行"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kairos.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kairós | AI-Powered BaZi & Eastern Personality Analysis",
    description: "Personalized life insights through ancient Eastern philosophical frameworks, powered by AI",
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US", "th_TH", "vi_VN", "id_ID"],
    siteName: "Kairós",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kairós | AI-Powered Eastern Personality Analysis",
    description: "BaZi Four Pillars + AI: Discover your destiny through 3,000 years of Eastern wisdom",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Kairós",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kairos.app",
  description: "AI-powered BaZi Four Pillars personality analysis platform combining 3,000 years of Eastern wisdom with modern AI.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Pro Analysis",
      price: "9.90",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Pro Membership",
      price: "4.99",
      priceCurrency: "USD",
      billingPeriod: "month",
    },
  ],
  inLanguage: ["zh", "en", "th", "vi", "id"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} ${chineseSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0814] text-amber-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <LocaleProvider>
            <ToastProvider>{children}</ToastProvider>
          </LocaleProvider>
        </AuthProvider>
        <MouseAura />
        <Analytics />
      </body>
    </html>
  );
}
