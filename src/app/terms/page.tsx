"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import BottomNav from "@/components/BottomNav";

export default function TermsPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen">
      <div className="lg:hidden flex items-center h-11 px-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link href="/" className="text-amber-800 mr-3 text-lg">←</Link>
        <span className="font-semibold text-[15px]">{t("footer.terms")}</span>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 lg:py-16 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("footer.terms")}</h1>

        <div className="prose prose-sm prose-gray max-w-none space-y-4 text-gray-600 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-800">1. Acceptance of Terms</h2>
          <p>By using TrustMaster, you agree to these terms of service. If you do not agree, please do not use our platform.</p>

          <h2 className="text-lg font-semibold text-gray-800">2. Service Description</h2>
          <p>TrustMaster is a platform that connects users with spiritual consultation practitioners. We do not provide spiritual services directly.</p>

          <h2 className="text-lg font-semibold text-gray-800">3. Disclaimer</h2>
          <p>All spiritual consultations provided through our platform are for entertainment and personal guidance purposes only. TrustMaster makes no guarantees about the accuracy or outcomes of any readings or consultations.</p>
          <p>You should not make important life, financial, medical, or legal decisions based solely on spiritual consultations.</p>

          <h2 className="text-lg font-semibold text-gray-800">4. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account. You must provide accurate information when creating an account.</p>

          <h2 className="text-lg font-semibold text-gray-800">5. Reviews and Content</h2>
          <p>Users may submit reviews that are honest and based on genuine experiences. We reserve the right to remove reviews that violate our guidelines.</p>

          <h2 className="text-lg font-semibold text-gray-800">6. Payment</h2>
          <p>All payments for consultations are made directly between users and masters via LINE. TrustMaster does not process payments.</p>

          <h2 className="text-lg font-semibold text-gray-800">7. Limitation of Liability</h2>
          <p>TrustMaster is not liable for any damages arising from the use of our platform or any consultations arranged through it.</p>

          <h2 className="text-lg font-semibold text-gray-800">8. Contact</h2>
          <p>For questions about these terms, contact us at support@trustmaster.app</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
