-- Migration: Create tours table
-- Story US-003

-- Tours table: groups booking runs into named tours
CREATE TABLE IF NOT EXISTS tours (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  artist_id   uuid        NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  start_date  date,
  end_date    date,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index on artist_id for FK lookup performance
CREATE INDEX IF NOT EXISTS tours_artist_id_idx ON tours (artist_id);

-- Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all ON tours
  FOR ALL
  USING (true)
  WITH CHECK (true);
