import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustMaster | Ancient Eastern Wisdom Meets AI",
  description:
    "Discover your destiny through 5,000 years of Chinese BaZi, Feng Shui, and astrology tradition — powered by AI. Get your personalized Four Pillars of Destiny analysis.",
  keywords: ["BaZi", "Four Pillars of Destiny", "Chinese astrology", "feng shui", "Eastern wisdom", "AI fortune", "destiny analysis", "five elements"],
  openGraph: {
    title: "TrustMaster | Ancient Eastern Wisdom Meets AI",
    description: "Discover your destiny through 5,000 years of Eastern metaphysical tradition, powered by AI",
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US", "th_TH", "vi_VN", "id_ID"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f5f1eb]">
        <AuthProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
