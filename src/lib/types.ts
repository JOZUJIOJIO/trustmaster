export interface Master {
  id: string;
  name: string;
  name_th: string;
  avatar_url: string | null;
  avatar_emoji: string;
  specialty: string[];
  specialty_th: string[];
  description: string;
  description_th: string;
  experience: number;
  rating: number;
  review_count: number;
  satisfaction_score: number;
  verified: boolean;
  price_min: number;
  price_max: number;
  line_id: string;
  location: string;
  location_th: string;
  languages: string[];
  availability: string;
}

export interface Review {
  id: string;
  master_id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  comment: string;
  comment_th: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  preferred_locale: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  master_id: string;
}
