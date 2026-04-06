"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useLocale } from "@/lib/LocaleContext";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0814]" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isChinese } = useLocale();

  const redirectTo = searchParams.get("redirect") || "/";

  const handleResetPassword = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || (isChinese ? "发送失败，请重试" : "Failed to send, please try again"));
    }
    setResetLoading(false);
  };

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
      router.push(redirectTo);
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

          {/* Google OAuth */}
          <button
            onClick={() => signInWithGoogle(redirectTo)}
            className="w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-amber-400/15 rounded-xl text-sm font-medium text-amber-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {isSignUp ? (isChinese ? "使用 Google 注册" : "Sign up with Google") : (isChinese ? "使用 Google 登录" : "Sign in with Google")}
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-amber-200/20 text-[10px]">or</span>
            <div className="flex-1 h-px bg-white/5" />
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

            {!forgotMode && !isSignUp && (
              <button
                type="button"
                onClick={() => { setForgotMode(true); setResetEmail(email); }}
                className="text-amber-400/50 text-xs hover:text-amber-400/80 transition-colors cursor-pointer text-right w-full"
              >
                {isChinese ? "忘记密码？" : "Forgot password?"}
              </button>
            )}

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

          {forgotMode && (
            <div className="space-y-4 mt-2">
              {resetSent ? (
                <div className="text-center space-y-3 py-4">
                  <div className="text-3xl">📧</div>
                  <p className="text-amber-100 text-sm font-semibold">
                    {isChinese ? "重置链接已发送" : "Reset link sent"}
                  </p>
                  <p className="text-amber-200/50 text-xs">
                    {isChinese ? `请检查 ${resetEmail} 的收件箱` : `Please check inbox for ${resetEmail}`}
                  </p>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false); }}
                    className="text-amber-400/60 text-xs hover:text-amber-400/80 cursor-pointer"
                  >
                    {isChinese ? "← 返回登录" : "← Back to login"}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-amber-200/50 text-xs text-center">
                    {isChinese ? "输入您的邮箱，我们将发送重置密码链接" : "Enter your email and we'll send a reset link"}
                  </p>
                  <div>
                    <label className="text-xs text-amber-200/40 mb-1 block">{isChinese ? "邮箱" : "Email"}</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-amber-400/15 text-amber-100 focus:outline-none focus:border-amber-400/40 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={resetLoading || !resetEmail}
                    className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {resetLoading ? "..." : (isChinese ? "发送重置链接" : "Send Reset Link")}
                  </button>
                  <button
                    onClick={() => setForgotMode(false)}
                    className="text-amber-400/50 text-xs hover:text-amber-400/80 cursor-pointer w-full text-center"
                  >
                    {isChinese ? "← 返回登录" : "← Back to login"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-amber-200/30 mt-6">
          {t("auth.disclaimer")}
        </p>
      </div>
    </div>
  );
}
