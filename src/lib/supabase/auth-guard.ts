// src/lib/supabase/auth-guard.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getTelegramSessionFromCookies, type TelegramSessionUser } from "@/lib/telegram/session";

export type AppAuthUser = {
  id: string;
  email?: string | null;
  appProvider?: "supabase" | "telegram";
};

/**
 * Get the authenticated user from the request cookies.
 * Returns { user } if authenticated, { user: null } otherwise.
 */
export async function getAuthUser(): Promise<{ user: AppAuthUser | null; telegramUser: TelegramSessionUser | null }> {
  const telegramUser = await getTelegramSessionFromCookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      user: telegramUser ? { id: `telegram:${telegramUser.telegramUserId}`, appProvider: "telegram" } : null,
      telegramUser,
    };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // API routes don't need to set cookies
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (user) return { user: { id: user.id, email: user.email, appProvider: "supabase" }, telegramUser: null };
  return {
    user: telegramUser ? { id: `telegram:${telegramUser.telegramUserId}`, appProvider: "telegram" } : null,
    telegramUser,
  };
}
