-- Migration: Create artists table
-- Story US-002

-- Reusable trigger function for updated_at (CREATE OR REPLACE so safe to reuse)
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        UNIQUE NOT NULL,
  genre       text,
  territory   text,
  color       text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS artists_slug_idx ON artists (slug);
CREATE INDEX IF NOT EXISTS artists_name_idx ON artists (name);

-- updated_at trigger
CREATE TRIGGER set_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all ON artists
  FOR ALL
  USING (true)
  WITH CHECK (true);
