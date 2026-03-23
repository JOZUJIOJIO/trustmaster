"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { isFavorited, toggleFavorite } from "@/lib/favorites";

export default function FavoriteButton({ masterId }: { masterId: string }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    isFavorited(user.id, masterId).then(setFavorited);
  }, [user, masterId]);

  if (!user) return null;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const result = await toggleFavorite(user.id, masterId);
    setFavorited(result);
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xl transition-all ${loading ? "opacity-50" : "hover:scale-110"}`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      {favorited ? "❤️" : "🤍"}
    </button>
  );
}
