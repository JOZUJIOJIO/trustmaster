import { createBrowserClient } from "@supabase/ssr";

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url !== "your-supabase-url" && !url.includes("placeholder") && url.startsWith("https://"));
}

let client: ReturnType<typeof createBrowserClient> | null = null;
let configured: boolean | null = null;

export function isSupabaseConfigured(): boolean {
  if (configured === null) configured = isConfigured();
  return configured;
}

export function createClient() {
  if (client) return client;

  if (!isSupabaseConfigured()) {
    // No real Supabase — return a dummy that won't make network requests
    const dummy = {
      from: () => ({
        select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null, single: () => ({ data: null, error: { message: "Not configured" } }), order: () => ({ data: [], error: null }) }), order: () => ({ data: [], error: null }), contains: () => ({ order: () => ({ data: [], error: null }) }) }),
        insert: () => ({ error: { message: "Not configured" } }),
        delete: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ error: { message: "Not configured" } }),
        signUp: () => Promise.resolve({ error: { message: "Not configured" } }),
        signOut: () => Promise.resolve(),
      },
    };
    return dummy as unknown as ReturnType<typeof createBrowserClient>;
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
