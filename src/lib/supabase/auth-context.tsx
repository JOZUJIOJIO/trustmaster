"use client";

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { createClient, isSupabaseConfigured } from "./client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = supabaseRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => {
        setUser(session?.user ?? null);
      }
    ) as any;

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseRef.current.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabaseRef.current.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async (redirectPath?: string) => {
    const target = redirectPath
      || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null)
      || "/";
    const { error } = await supabaseRef.current.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined"
          ? `${window.location.origin}${target}`
          : undefined,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabaseRef.current.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
