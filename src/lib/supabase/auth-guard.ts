// src/lib/supabase/auth-guard.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Get the authenticated user from the request cookies.
 * Returns { user } if authenticated, { user: null } otherwise.
 */
export async function getAuthUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { user: null };

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
  return { user };
}
