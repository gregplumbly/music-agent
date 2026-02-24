-- Migration: Create booking_status_log table
-- Story US-006

-- booking_status_log table (depends on: bookings)
CREATE TABLE IF NOT EXISTS booking_status_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_status text,
  to_status   text        NOT NULL,
  changed_at  timestamptz NOT NULL DEFAULT now(),
  note        text
);

-- Indexes
CREATE INDEX IF NOT EXISTS booking_status_log_booking_id_idx ON booking_status_log (booking_id);
CREATE INDEX IF NOT EXISTS booking_status_log_changed_at_idx ON booking_status_log (changed_at);

-- Row Level Security
ALTER TABLE booking_status_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all ON booking_status_log
  FOR ALL
  USING (true)
  WITH CHECK (true);
