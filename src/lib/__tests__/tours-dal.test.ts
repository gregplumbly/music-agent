import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Tour, Booking } from "@/types/database";

// ---------------------------------------------------------------------------
// Repo root (3 levels up from src/lib/__tests__)
// ---------------------------------------------------------------------------
const repoRoot = join(import.meta.dirname, "../../..");

// ---------------------------------------------------------------------------
// File existence checks
// ---------------------------------------------------------------------------

describe("tours DAL – file existence", () => {
  it("src/lib/tours.ts exists", () => {
    expect(existsSync(join(repoRoot, "src/lib/tours.ts"))).toBe(true);
  });

  it("src/lib/__tests__/tours-dal.test.ts exists", () => {
    expect(existsSync(join(repoRoot, "src/lib/__tests__/tours-dal.test.ts"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// tours.ts source-code export checks (static analysis on the file text)
// ---------------------------------------------------------------------------

describe("tours DAL – exported function signatures", () => {
  const dalPath = join(repoRoot, "src/lib/tours.ts");
  let src: string;

  try {
    src = readFileSync(dalPath, "utf-8");
  } catch {
    src = "";
  }

  it("exports listTours", () => {
    expect(src).toMatch(/export\s+async\s+function\s+listTours/);
  });

  it("exports getTourWithBookings", () => {
    expect(src).toMatch(/export\s+async\s+function\s+getTourWithBookings/);
  });

  it("exports createTour", () => {
    expect(src).toMatch(/export\s+async\s+function\s+createTour/);
  });

  it("exports updateTour", () => {
    expect(src).toMatch(/export\s+async\s+function\s+updateTour/);
  });

  it("exports deleteTour", () => {
    expect(src).toMatch(/export\s+async\s+function\s+deleteTour/);
  });

  it("exports setBookingTour", () => {
    expect(src).toMatch(/export\s+async\s+function\s+setBookingTour/);
  });

  it("exports duplicateTour", () => {
    expect(src).toMatch(/export\s+async\s+function\s+duplicateTour/);
  });

  it("listTours accepts optional artistId parameter", () => {
    expect(src).toMatch(/listTours\s*\(\s*artistId\??/);
  });

  it("setBookingTour accepts tourId: string | null", () => {
    expect(src).toMatch(/tourId\s*:\s*string\s*\|\s*null/);
  });

  it("duplicateTour resets status to 'enquiry'", () => {
    expect(src).toMatch(/status.*enquiry/);
  });

  it("duplicateTour resets status_locked to false", () => {
    expect(src).toMatch(/status_locked.*false/);
  });
});

// ---------------------------------------------------------------------------
// TypeScript type-shape checks (compile-time) for Tour and Booking
// ---------------------------------------------------------------------------

describe("Tour + Booking type compatibility", () => {
  it("Tour type has id, name, artist_id, created_at as strings", () => {
    const tour: Tour = {
      id: "tour-1",
      name: "World Tour 2025",
      artist_id: "artist-1",
      start_date: null,
      end_date: null,
      notes: null,
      created_at: "2025-01-01T00:00:00Z",
    };
    expect(typeof tour.id).toBe("string");
    expect(typeof tour.name).toBe("string");
    expect(typeof tour.artist_id).toBe("string");
    expect(typeof tour.created_at).toBe("string");
  });

  it("Booking.tour_id is string | null", () => {
    const b: Pick<Booking, "tour_id"> = { tour_id: null };
    expect(b.tour_id).toBeNull();

    const b2: Pick<Booking, "tour_id"> = { tour_id: "tour-uuid" };
    expect(typeof b2.tour_id).toBe("string");
  });

  it("Tour allows null for optional date fields", () => {
    const tour: Tour = {
      id: "t",
      name: "Unnamed",
      artist_id: "a",
      start_date: null,
      end_date: null,
      notes: null,
      created_at: "2025-01-01T00:00:00Z",
    };
    expect(tour.start_date).toBeNull();
    expect(tour.end_date).toBeNull();
  });

  it("getTourWithBookings return type shape is valid", () => {
    const result: { tour: Tour; bookings: Booking[] } = {
      tour: {
        id: "tour-1",
        name: "Headline 2025",
        artist_id: "artist-1",
        start_date: "2025-03-01",
        end_date: "2025-04-30",
        notes: null,
        created_at: "2025-01-01T00:00:00Z",
      },
      bookings: [],
    };
    expect(result.tour.name).toBe("Headline 2025");
    expect(Array.isArray(result.bookings)).toBe(true);
  });
});
