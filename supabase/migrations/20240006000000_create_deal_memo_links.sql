-- Migration: Create deal_memo_links table
-- Story US-007

-- Enum for deal memo link status
CREATE TYPE deal_memo_link_status AS ENUM ('sent', 'viewed', 'submitted', 'expired');

-- deal_memo_links table (depends on: bookings)
CREATE TABLE IF NOT EXISTS deal_memo_links (
  id              uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid                   NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  token           text                   UNIQUE NOT NULL,
  status          deal_memo_link_status  NOT NULL DEFAULT 'sent',
  submitted_data  jsonb,
  created_at      timestamptz            NOT NULL DEFAULT now(),
  expires_at      timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS deal_memo_links_booking_id_idx ON deal_memo_links (booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS deal_memo_links_token_idx ON deal_memo_links (token);

-- Row Level Security
ALTER TABLE deal_memo_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all ON deal_memo_links
  FOR ALL
  USING (true)
  WITH CHECK (true);
