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
  title: "TrustMaster | Find Trusted Spiritual Masters in Thailand",
  description:
    "A verified spiritual consultation platform with real user reviews. Find trusted astrology, tarot, feng shui, and palmistry masters in Thailand.",
  keywords: ["spiritual masters", "astrology", "tarot", "feng shui", "palmistry", "Thailand", "Bangkok"],
  openGraph: {
    title: "TrustMaster | Find Trusted Spiritual Masters",
    description: "A verified spiritual consultation platform with real user reviews in Thailand",
    type: "website",
    locale: "th_TH",
    alternateLocale: ["en_US", "zh_CN", "vi_VN", "id_ID"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
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
