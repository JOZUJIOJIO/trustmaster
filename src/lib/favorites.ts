import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Master } from "@/lib/types";

function getSupabase() {
  return createClient();
}

export async function getFavorites(userId: string): Promise<Master[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabase()
    .from("favorites")
    .select("master_id, masters(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((f: any) => f.masters).filter(Boolean) as Master[];
}

export async function isFavorited(userId: string, masterId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { count, error } = await getSupabase()
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("master_id", masterId);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function toggleFavorite(
  userId: string,
  masterId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const favorited = await isFavorited(userId, masterId);

  if (favorited) {
    await getSupabase()
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("master_id", masterId);
    return false;
  } else {
    await getSupabase()
      .from("favorites")
      .insert({ user_id: userId, master_id: masterId });
    return true;
  }
}
