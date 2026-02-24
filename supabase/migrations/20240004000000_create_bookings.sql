-- Migration: Create bookings table
-- Story US-005

-- bookings table (depends on: artists, tours, booking_status enum, deal_type enum)
CREATE TABLE IF NOT EXISTS bookings (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id         uuid          NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  tour_id           uuid          REFERENCES tours(id) ON DELETE SET NULL,
  status            booking_status NOT NULL DEFAULT 'enquiry',
  status_locked     boolean       NOT NULL DEFAULT false,
  date              date          NOT NULL,
  day_of_week       text          GENERATED ALWAYS AS (to_char(date, 'Day')) STORED,
  country           text,
  city              text,
  venue_name        text,
  venue_capacity    integer,
  room              text,
  room_capacity     integer,
  currency          text,
  fee               numeric(12,2),
  deal_type         deal_type,
  deal_percentage   numeric(5,2),
  deal_versus       boolean       NOT NULL DEFAULT false,
  expenses          numeric(12,2),
  buyout            numeric(12,2),
  add_ons           text,
  billing           text,
  set_length        integer,
  set_time          time,
  promoter_name     text,
  promoter_email    text,
  promoter_company  text,
  previous_artists  text,
  artists_booked    text,
  notes             text,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS bookings_artist_id_idx ON bookings (artist_id);
CREATE INDEX IF NOT EXISTS bookings_tour_id_idx ON bookings (tour_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings (date);
CREATE INDEX IF NOT EXISTS bookings_artist_id_date_idx ON bookings (artist_id, date);

-- updated_at trigger (reuses handle_updated_at() function from artists migration)
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);
