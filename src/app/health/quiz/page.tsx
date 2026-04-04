"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { useAuth } from "@/lib/supabase/auth-context";
import QuizStepper from "@/components/health/QuizStepper";
import ConstitutionBadge from "@/components/health/ConstitutionBadge";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import type { QuizAnswer } from "@/lib/types";

type Phase = "quiz" | "preview" | "loading";

export default function HealthQuizPage() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ elementType: string; constitutionType: string; secondaryType: string | null } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { locale, t } = useLocale();
  const router = useRouter();

  const handleQuizComplete = useCallback(async (answers: QuizAnswer[]) => {
    if (!user) {
      router.push("/login?redirect=/health/quiz");
      return;
    }

    setPhase("loading");
    setError("");

    try {
      const res = await fetch("/api/health/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Assessment failed");
      const data = await res.json();
      setAssessmentId(data.assessmentId);
      setPreview(data.preview);
      setPhase("preview");
    } catch {
      setError(locale === "zh" ? "提交失败，请重试" : "Submission failed, please try again");
      setPhase("quiz");
    }
  }, [user, router, locale]);

  const handleCheckout = useCallback(async () => {
    if (!assessmentId) return;
    setCheckoutLoading(true);

    try {
      const res = await fetch("/api/health/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError(locale === "zh" ? "支付创建失败" : "Payment failed");
    } finally {
      setCheckoutLoading(false);
    }
  }, [assessmentId, locale]);

  return (
    <div className="min-h-screen bg-[#0a0814]">
      <PageHeader title={t("health.title")} backHref="/health" />

      <div className="py-8 lg:py-16 max-w-lg mx-auto">
        {phase === "quiz" && (
          <>
            {error && (
              <p className="text-red-400 text-xs text-center mb-4">{error}</p>
            )}
            <QuizStepper onComplete={handleQuizComplete} />
          </>
        )}

        {phase === "loading" && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">🌿</div>
            <p className="text-amber-200/50 text-sm">
              {locale === "zh" ? "正在分析你的体质..." : "Analyzing your constitution..."}
            </p>
          </div>
        )}

        {phase === "preview" && preview && (
          <div className="px-4 text-center">
            {/* Free preview */}
            <div className="mb-8 py-8">
              <p className="text-[10px] text-amber-400/40 tracking-[0.3em] uppercase mb-6">
                {t("health.preview.title")}
              </p>
              <ConstitutionBadge
                elementType={preview.elementType}
                constitutionType={preview.constitutionType}
                secondaryType={preview.secondaryType}
                isChinese={locale === "zh"}
              />
            </div>

            {/* Paywall */}
            <div className="bg-white/[0.02] rounded-2xl border border-amber-400/10 p-6">
              <h3 className="text-base font-bold text-amber-100 mb-2">
                {t("health.preview.unlock")}
              </h3>
              <p className="text-xs text-amber-200/40 mb-6">
                {locale === "zh"
                  ? "解锁脏腑地图、食疗方案、四季调养、AI 追问"
                  : "Unlock organ map, diet therapy, seasonal wellness, AI follow-up"}
              </p>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-4 rounded-full font-semibold text-base cursor-pointer
                           bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white
                           border border-amber-500/30 disabled:opacity-50
                           hover:shadow-[0_0_40px_rgba(217,119,6,0.3)] transition-all"
              >
                {checkoutLoading
                  ? (locale === "zh" ? "跳转支付中..." : "Redirecting...")
                  : `${t("health.preview.unlock")} — ${t("health.preview.price")}`
                }
              </button>
              {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
