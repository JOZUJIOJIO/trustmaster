"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password, displayName)
      : await signIn(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0814]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-4xl">🔮</span>
            <h1 className="text-2xl font-bold text-amber-200 mt-2">{t("app.name")}</h1>
          </Link>
          <p className="text-sm text-amber-200/40 mt-1">{t("app.tagline")}</p>
        </div>

        <div className="bg-white/[0.03] rounded-2xl border border-amber-400/10 p-6">
          <div className="flex mb-6 bg-white/[0.05] rounded-xl p-1">
            <button
              onClick={() => { setIsSignUp(false); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isSignUp ? "bg-white/[0.08] text-amber-200" : "text-amber-200/40"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSignUp ? "bg-white/[0.08] text-amber-200" : "text-amber-200/40"
              }`}
            >
              {t("auth.signup")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-amber-200/60 mb-1">
                  {t("auth.displayName")}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-400/20 bg-white/[0.05] text-amber-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400/40"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-amber-200/60 mb-1">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-400/20 bg-white/[0.05] text-amber-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400/40"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-200/60 mb-1">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-400/20 bg-white/[0.05] text-amber-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400/40"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-600 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {loading
                ? t("auth.loading")
                : isSignUp
                  ? t("auth.signup")
                  : t("auth.login")}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-amber-200/30 mt-6">
          {t("auth.disclaimer")}
        </p>
      </div>
    </div>
  );
}
