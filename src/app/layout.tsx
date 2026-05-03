import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Playfair_Display, LXGW_WenKai_TC } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ThemeProvider } from "@/lib/ThemeContext";
import { Analytics } from "@vercel/analytics/react";
import MouseAura from "@/components/MouseAura";
import { ToastProvider } from "@/components/Toast";
import TelegramMiniAppBridge from "@/components/TelegramMiniAppBridge";

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

const chineseSerif = LXGW_WenKai_TC({
  variable: "--font-chinese",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Kairós | AI-powered Eastern personal insight",
    template: "%s | Kairós",
  },
  description:
    "AI-powered Eastern personal insight for self-reflection, Five Elements balance, cultural wellness, and daily action guidance.",
  keywords: ["personal insights", "five elements", "Eastern philosophy", "AI self-reflection", "cultural wellness", "daily insights", "东方哲学", "个人洞察", "五行", "自我观察"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kairos.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kairós | AI-powered Eastern personal insight",
    description: "Structured self-reflection and cultural wellness insights powered by AI",
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US", "th_TH", "vi_VN", "id_ID"],
    siteName: "Kairós",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kairós | AI-powered Eastern personal insight",
    description: "Five Elements, cultural self-reflection, and daily action guidance powered by AI",
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
  description: "AI-powered Eastern personal insight platform for cultural self-reflection, Five Elements balance, and daily action guidance.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Pro Insight Report",
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
        <ThemeProvider>
          <AuthProvider>
            <LocaleProvider>
              <ToastProvider>
                <TelegramMiniAppBridge />
                {children}
              </ToastProvider>
            </LocaleProvider>
          </AuthProvider>
        </ThemeProvider>
        <MouseAura />
        <Analytics />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
