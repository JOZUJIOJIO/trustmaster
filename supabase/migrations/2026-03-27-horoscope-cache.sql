-- Horoscope cache — one AI call per (sign, locale, date)
CREATE TABLE IF NOT EXISTS horoscope_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sign TEXT NOT NULL,
  locale TEXT NOT NULL,
  date TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sign, locale, date)
);

CREATE INDEX IF NOT EXISTS idx_horoscope_cache_lookup ON horoscope_cache(sign, locale, date);

ALTER TABLE horoscope_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Horoscope cache is readable by everyone"
  ON horoscope_cache FOR SELECT
  USING (true);
