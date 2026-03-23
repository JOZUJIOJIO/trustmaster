import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Master, Review } from "@/lib/types";
import { masters as mockMasters, reviews as mockReviews, filterMasters as mockFilter } from "@/lib/data";

function getSupabase() {
  return createClient();
}

// Convert mock data Master to DB Master format
function toDbMaster(m: import("@/lib/data").Master): Master {
  return {
    id: m.id,
    name: m.name,
    name_th: m.nameTh,
    avatar_url: null,
    avatar_emoji: m.avatar,
    specialty: m.specialty,
    specialty_th: m.specialtyTh,
    description: m.description,
    description_th: m.descriptionTh,
    experience: m.experience,
    rating: m.rating,
    review_count: m.reviewCount,
    satisfaction_score: m.satisfactionScore,
    verified: m.verified,
    price_min: m.priceRange.min,
    price_max: m.priceRange.max,
    line_id: m.lineId,
    location: m.location,
    location_th: m.locationTh,
    languages: m.languages,
    availability: m.availability,
  };
}

function toDbReview(r: import("@/lib/data").Review): Review {
  return {
    id: r.id,
    master_id: r.masterId,
    user_id: null,
    user_name: r.userName,
    rating: r.rating,
    comment: r.comment,
    comment_th: r.commentTh,
    created_at: r.createdAt,
  };
}

export async function getMasters(): Promise<Master[]> {
  if (!isSupabaseConfigured()) {
    return mockMasters.map(toDbMaster);
  }

  const { data, error } = await getSupabase()
    .from("masters")
    .select("*")
    .order("review_count", { ascending: false });

  if (error) {
    console.error("Error fetching masters:", error);
    return mockMasters.map(toDbMaster);
  }
  return data ?? [];
}

export async function getMasterById(id: string): Promise<Master | null> {
  if (!isSupabaseConfigured()) {
    const m = mockMasters.find((m) => m.id === id);
    return m ? toDbMaster(m) : null;
  }

  const { data, error } = await getSupabase()
    .from("masters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching master:", error);
    const m = mockMasters.find((m) => m.id === id);
    return m ? toDbMaster(m) : null;
  }
  return data;
}

export async function getReviewsByMasterId(masterId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return mockReviews.filter((r) => r.masterId === masterId).map(toDbReview);
  }

  const { data, error } = await getSupabase()
    .from("reviews")
    .select("*")
    .eq("master_id", masterId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return mockReviews.filter((r) => r.masterId === masterId).map(toDbReview);
  }
  return data ?? [];
}

export async function filterMasters(
  category: string,
  search: string
): Promise<Master[]> {
  if (!isSupabaseConfigured()) {
    return mockFilter(category, search).map(toDbMaster);
  }

  let query = getSupabase().from("masters").select("*");

  if (category && category !== "all") {
    query = query.contains("specialty", [category]);
  }

  const { data, error } = await query.order("review_count", { ascending: false });

  if (error) {
    console.error("Error filtering masters:", error);
    return mockFilter(category, search).map(toDbMaster);
  }

  let results: Master[] = (data ?? []) as Master[];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (m: Master) =>
        m.name.toLowerCase().includes(q) ||
        m.name_th.includes(q) ||
        m.specialty.some((s: string) => s.toLowerCase().includes(q)) ||
        m.specialty_th.some((s: string) => s.includes(q))
    );
  }

  return results;
}

export async function submitReview(review: {
  master_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  comment_th: string;
}): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }

  const { error } = await getSupabase().from("reviews").insert(review);
  if (error) {
    console.error("Error submitting review:", error);
    return { error: error.message };
  }
  return { error: null };
}
