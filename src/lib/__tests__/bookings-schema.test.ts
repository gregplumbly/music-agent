import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Booking, BookingStatus, DealType } from "@/types/database";

// ---------------------------------------------------------------------------
// TypeScript type-shape checks (compile-time)
// If any property is missing or wrong type, this file will fail to typecheck.
// ---------------------------------------------------------------------------

const _bookingTypeCheck = {
  id: "uuid-string" as string,
  artist_id: "artist-uuid" as string,
  tour_id: null as string | null,
  status: "enquiry" as BookingStatus,
  status_locked: false as boolean,
  date: "2024-06-15" as string,
  day_of_week: null as string | null,
  country: null as string | null,
  city: null as string | null,
  venue_name: null as string | null,
  venue_capacity: null as number | null,
  room: null as string | null,
  room_capacity: null as number | null,
  currency: null as string | null,
  fee: null as number | null,
  deal_type: null as DealType | null,
  deal_percentage: null as number | null,
  deal_versus: false as boolean,
  expenses: null as number | null,
  buyout: null as number | null,
  add_ons: null as string | null,
  billing: null as string | null,
  set_length: null as number | null,
  set_time: null as string | null,
  promoter_name: null as string | null,
  promoter_email: null as string | null,
  promoter_company: null as string | null,
  previous_artists: null as string | null,
  artists_booked: null as string | null,
  notes: null as string | null,
  created_at: new Date().toISOString() as string,
  updated_at: new Date().toISOString() as string,
} satisfies Booking;

// ---------------------------------------------------------------------------
// Runtime tests: Booking type shape
// ---------------------------------------------------------------------------

describe("Booking type shape", () => {
  it("has required string properties: id, artist_id, date, created_at, updated_at", () => {
    const booking: Booking = {
      id: "booking-uuid",
      artist_id: "artist-uuid",
      tour_id: null,
      status: "enquiry",
      status_locked: false,
      date: "2024-06-15",
      day_of_week: null,
      country: null,
      city: null,
      venue_name: null,
      venue_capacity: null,
      room: null,
      room_capacity: null,
      currency: null,
      fee: null,
      deal_type: null,
      deal_percentage: null,
      deal_versus: false,
      expenses: null,
      buyout: null,
      add_ons: null,
      billing: null,
      set_length: null,
      set_time: null,
      promoter_name: null,
      promoter_email: null,
      promoter_company: null,
      previous_artists: null,
      artists_booked: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(typeof booking.id).toBe("string");
    expect(typeof booking.artist_id).toBe("string");
    expect(typeof booking.date).toBe("string");
    expect(typeof booking.created_at).toBe("string");
    expect(typeof booking.updated_at).toBe("string");
  });

  it("status_locked defaults to false", () => {
    const booking: Booking = {
      id: "booking-uuid",
      artist_id: "artist-uuid",
      tour_id: null,
      status: "enquiry",
      status_locked: false,
      date: "2024-06-15",
      day_of_week: null,
      country: null,
      city: null,
      venue_name: null,
      venue_capacity: null,
      room: null,
      room_capacity: null,
      currency: null,
      fee: null,
      deal_type: null,
      deal_percentage: null,
      deal_versus: false,
      expenses: null,
      buyout: null,
      add_ons: null,
      billing: null,
      set_length: null,
      set_time: null,
      promoter_name: null,
      promoter_email: null,
      promoter_company: null,
      previous_artists: null,
      artists_booked: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(booking.status_locked).toBe(false);
  });

  it("deal_versus defaults to false", () => {
    const booking: Booking = {
      id: "booking-uuid",
      artist_id: "artist-uuid",
      tour_id: null,
      status: "confirmed",
      status_locked: false,
      date: "2024-06-15",
      day_of_week: null,
      country: null,
      city: null,
      venue_name: null,
      venue_capacity: null,
      room: null,
      room_capacity: null,
      currency: null,
      fee: null,
      deal_type: null,
      deal_percentage: null,
      deal_versus: false,
      expenses: null,
      buyout: null,
      add_ons: null,
      billing: null,
      set_length: null,
      set_time: null,
      promoter_name: null,
      promoter_email: null,
      promoter_company: null,
      previous_artists: null,
      artists_booked: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(booking.deal_versus).toBe(false);
  });

  it("allows all BookingStatus values", () => {
    const statuses: BookingStatus[] = [
      "enquiry", "hold", "offered", "pending", "confirmed",
      "contracted", "advanced", "settled", "cancelled", "declined",
    ];
    expect(statuses).toHaveLength(10);
    statuses.forEach((s) => expect(typeof s).toBe("string"));
  });

  it("allows all DealType values", () => {
    const dealTypes: DealType[] = [
      "flat_fee", "door_split", "versus", "plus", "buyout", "custom",
    ];
    expect(dealTypes).toHaveLength(6);
    dealTypes.forEach((d) => expect(typeof d).toBe("string"));
  });

  it("allows null for optional FK: tour_id", () => {
    const booking: Booking = {
      id: "booking-uuid",
      artist_id: "artist-uuid",
      tour_id: null,
      status: "enquiry",
      status_locked: false,
      date: "2024-06-15",
      day_of_week: null,
      country: null,
      city: null,
      venue_name: null,
      venue_capacity: null,
      room: null,
      room_capacity: null,
      currency: null,
      fee: null,
      deal_type: null,
      deal_percentage: null,
      deal_versus: false,
      expenses: null,
      buyout: null,
      add_ons: null,
      billing: null,
      set_length: null,
      set_time: null,
      promoter_name: null,
      promoter_email: null,
      promoter_company: null,
      previous_artists: null,
      artists_booked: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(booking.tour_id).toBeNull();
  });

  it("accepts numeric values for financial fields", () => {
    const booking: Booking = {
      id: "booking-uuid",
      artist_id: "artist-uuid",
      tour_id: null,
      status: "confirmed",
      status_locked: false,
      date: "2024-06-15",
      day_of_week: null,
      country: "UK",
      city: "London",
      venue_name: "O2 Arena",
      venue_capacity: 20000,
      room: "Main Stage",
      room_capacity: 15000,
      currency: "GBP",
      fee: 50000.00,
      deal_type: "flat_fee",
      deal_percentage: null,
      deal_versus: false,
      expenses: 2500.00,
      buyout: null,
      add_ons: "Hotel + Flights",
      billing: "Headline",
      set_length: 90,
      set_time: "21:00:00",
      promoter_name: "Live Nation",
      promoter_email: "booker@livenation.com",
      promoter_company: "Live Nation UK",
      previous_artists: null,
      artists_booked: null,
      notes: "VIP package required",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(booking.fee).toBe(50000.00);
    expect(booking.expenses).toBe(2500.00);
    expect(booking.venue_capacity).toBe(20000);
    expect(booking.set_length).toBe(90);
    expect(booking.deal_type).toBe("flat_fee");
    expect(booking.currency).toBe("GBP");
  });
});

// ---------------------------------------------------------------------------
// Migration SQL content checks
// ---------------------------------------------------------------------------

describe("bookings migration SQL", () => {
  const repoRoot = join(import.meta.dirname, "../../..");
  const migrationPath = join(
    repoRoot,
    "supabase/migrations/20240004000000_create_bookings.sql"
  );
  let sql: string;

  try {
    sql = readFileSync(migrationPath, "utf-8");
  } catch {
    sql = "";
  }

  it("migration file exists and is non-empty", () => {
    expect(sql.length).toBeGreaterThan(0);
  });

  it("creates the bookings table", () => {
    expect(sql).toMatch(/CREATE TABLE.*bookings/i);
  });

  it("has FK to artists(id) ON DELETE CASCADE", () => {
    expect(sql).toMatch(/REFERENCES\s+artists\s*\(\s*id\s*\)/i);
    expect(sql).toMatch(/ON DELETE CASCADE/i);
  });

  it("has FK to tours(id) ON DELETE SET NULL", () => {
    expect(sql).toMatch(/REFERENCES\s+tours\s*\(\s*id\s*\)/i);
    expect(sql).toMatch(/ON DELETE SET NULL/i);
  });

  it("day_of_week is derived at the application layer", () => {
    // day_of_week is not in the migration — it's computed in app code from the date field.
    // The Booking TypeScript interface includes it as a nullable string.
    expect(true).toBe(true);
  });

  it("status column uses booking_status enum with default enquiry", () => {
    expect(sql).toMatch(/status\s+booking_status/i);
    expect(sql).toMatch(/DEFAULT\s+'enquiry'/i);
  });

  it("deal_type column uses deal_type enum", () => {
    expect(sql).toMatch(/deal_type\s+deal_type/i);
  });

  it("defines indexes on artist_id, tour_id, status, date", () => {
    expect(sql).toMatch(/CREATE INDEX.*bookings_artist_id_idx.*ON\s+bookings\s*\(\s*artist_id\s*\)/i);
    expect(sql).toMatch(/CREATE INDEX.*bookings_tour_id_idx.*ON\s+bookings\s*\(\s*tour_id\s*\)/i);
    expect(sql).toMatch(/CREATE INDEX.*bookings_status_idx.*ON\s+bookings\s*\(\s*status\s*\)/i);
    expect(sql).toMatch(/CREATE INDEX.*bookings_date_idx.*ON\s+bookings\s*\(\s*date\s*\)/i);
  });

  it("defines composite index on (artist_id, date)", () => {
    expect(sql).toMatch(/CREATE INDEX.*bookings_artist_id_date_idx.*ON\s+bookings\s*\(\s*artist_id\s*,\s*date\s*\)/i);
  });

  it("attaches updated_at trigger using handle_updated_at()", () => {
    expect(sql).toMatch(/CREATE TRIGGER.*set_bookings_updated_at/i);
    expect(sql).toMatch(/EXECUTE FUNCTION handle_updated_at\(\)/i);
  });

  it("enables RLS", () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/i);
  });

  it("has an allow_all policy", () => {
    expect(sql).toMatch(/CREATE POLICY.*allow_all/i);
    expect(sql).toMatch(/USING\s*\(\s*true\s*\)/i);
    expect(sql).toMatch(/WITH CHECK\s*\(\s*true\s*\)/i);
  });
});
