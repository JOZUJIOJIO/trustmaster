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
  title: "TrustMaster | AI-Powered Eastern Personality & Life Insights",
  description:
    "Discover personalized life insights through ancient Eastern philosophical frameworks powered by AI. BaZi Four Pillars personality analysis, Five Elements balance, and cultural wellness guidance.",
  keywords: ["BaZi", "Four Pillars analysis", "personality insights", "five elements", "Eastern philosophy", "AI life analysis", "self-discovery", "cultural wellness"],
  openGraph: {
    title: "TrustMaster | AI-Powered Eastern Personality & Life Insights",
    description: "Personalized life insights through ancient Eastern philosophical frameworks, powered by AI",
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
