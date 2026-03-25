"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";
import { submitReview } from "@/lib/db";
import Link from "next/link";

export default function ReviewForm({
  masterId,
  onSubmitted,
}: {
  masterId: string;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const { t } = useLocale();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="bg-amber-900/10 rounded-xl p-4 border border-amber-400/10 text-center">
        <p className="text-sm text-amber-200/60 mb-2">{t("review.loginRequired")}</p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-lg text-sm font-semibold"
        >
          {t("auth.login")}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    setError("");

    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";

    const result = await submitReview({
      master_id: masterId,
      user_id: user.id,
      user_name: displayName,
      rating,
      comment: comment.trim(),
      comment_th: comment.trim(),
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setComment("");
      setRating(5);
      onSubmitted();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-amber-900/10 rounded-xl p-4 border border-amber-400/10">
      <h3 className="text-sm font-semibold text-amber-200/80 mb-3">{t("review.writeReview")}</h3>

      {/* Star Rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition-colors ${
              star <= rating ? "text-amber-500" : "text-amber-200/20"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("review.placeholder")}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-amber-400/20 text-sm text-amber-100 placeholder:text-amber-200/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400/40 resize-none bg-white/[0.05]"
        required
      />

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !comment.trim()}
        className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 disabled:opacity-40 text-white rounded-lg font-semibold text-sm transition-colors"
      >
        {loading ? t("review.submitting") : t("review.submit")}
      </button>
    </form>
  );
}
