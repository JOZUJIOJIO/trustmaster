"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";

export default function PrivacyPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[#0a0814]">
      <div className="lg:hidden flex items-center h-11 px-4 border-b border-amber-400/10 sticky top-0 bg-[#0a0814] z-10">
        <Link href="/" className="text-amber-200/60 hover:text-amber-200 mr-3 text-lg">←</Link>
        <span className="font-semibold text-[15px] text-amber-100">{t("footer.privacy")}</span>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 lg:py-16 pb-24">
        <h1 className="text-2xl font-bold text-amber-100 mb-6">{t("footer.privacy")}</h1>

        <div className="prose prose-sm prose-invert max-w-none space-y-4 text-amber-200/60 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-amber-200/80">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account (email, display name) and usage data to improve our service.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">2. How We Use Your Information</h2>
          <p>Your information is used to provide our service, manage your account, and improve user experience. We do not sell your personal data.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">3. Data Storage</h2>
          <p>Your data is stored securely using industry-standard encryption and hosted on trusted cloud infrastructure.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">4. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We use analytics cookies to understand usage patterns.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">5. Payment Information</h2>
          <p>Payment processing is handled by Stripe, Inc. We do not store your credit card numbers, CVV, or full payment details on our servers. Stripe processes your payment information in compliance with PCI DSS Level 1, the highest level of payment security certification.</p>
          <p>We retain only transaction records (purchase date, amount, product purchased) for accounting purposes.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">6. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul style={{listStyleType: "disc", paddingLeft: "20px"}}>
            <li>Supabase — authentication and data storage</li>
            <li>Vercel — hosting and analytics</li>
            <li>Stripe — payment processing</li>
            <li>AI services — report generation (birth data is processed but not permanently stored by AI providers)</li>
          </ul>
          <p>Each service has its own privacy policy.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">7. Your Rights</h2>
          <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">7. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can delete your account at any time.</p>

          <h2 className="text-lg font-semibold text-amber-200/80">8. Contact</h2>
          <p>For privacy concerns, contact us at hello@kairos.app</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
