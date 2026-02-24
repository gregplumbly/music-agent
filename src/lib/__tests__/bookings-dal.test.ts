import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";

vi.mock("@/lib/supabase", () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(chain),
      _chain: chain,
    },
  };
});

import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  duplicateBooking,
  deleteBooking,
} from "@/lib/bookings";
import { supabase } from "@/lib/supabase";

const getChain = () =>
  (supabase as unknown as { _chain: Record<string, MockInstance> })._chain;

const sampleBooking = {
  id: "booking-1",
  artist_id: "artist-1",
  tour_id: null,
  status: "enquiry" as const,
  status_locked: false,
  date: "2026-06-15",
  day_of_week: "Monday",
  country: "UK",
  city: "London",
  venue_name: "Fabric",
  venue_capacity: 1500,
  room: "Room 1",
  room_capacity: 800,
  currency: "GBP",
  fee: 5000,
  deal_type: "flat_fee" as const,
  deal_percentage: null,
  deal_versus: false,
  expenses: null,
  buyout: null,
  add_ons: null,
  billing: "Headliner",
  set_length: 90,
  set_time: "02:00",
  promoter_name: "John Doe",
  promoter_email: "john@example.com",
  promoter_company: "Promo Co",
  previous_artists: null,
  artists_booked: null,
  notes: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const sampleBookingWithArtist = {
  ...sampleBooking,
  artists: { name: "DJ Example", color: "#3b82f6", slug: "dj-example" },
};

beforeEach(() => {
  vi.clearAllMocks();
  (supabase.from as unknown as MockInstance).mockReturnValue(getChain());
  const chain = getChain();
  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.gte.mockReturnValue(chain);
  chain.lte.mockReturnValue(chain);
  chain.or.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
});

describe("getBookings", () => {
  it("returns list of bookings ordered by date", async () => {
    const chain = getChain();
    chain.order.mockResolvedValueOnce({
      data: [sampleBookingWithArtist],
      error: null,
    });

    const result = await getBookings();
    expect(result).toEqual([sampleBookingWithArtist]);
    expect(supabase.from).toHaveBeenCalledWith("bookings");
    expect(chain.select).toHaveBeenCalledWith("*, artists(name, color, slug)");
  });

  it("applies filters when provided", async () => {
    const chain = getChain();
    chain.order.mockResolvedValueOnce({ data: [], error: null });

    await getBookings({
      artist_id: "artist-1",
      status: "confirmed",
      date_from: "2026-01-01",
      date_to: "2026-12-31",
      search: "London",
    });

    expect(chain.eq).toHaveBeenCalledWith("artist_id", "artist-1");
    expect(chain.eq).toHaveBeenCalledWith("status", "confirmed");
    expect(chain.gte).toHaveBeenCalledWith("date", "2026-01-01");
    expect(chain.lte).toHaveBeenCalledWith("date", "2026-12-31");
    expect(chain.or).toHaveBeenCalledWith(
      "city.ilike.%London%,venue_name.ilike.%London%,promoter_name.ilike.%London%"
    );
  });

  it("throws on error", async () => {
    const chain = getChain();
    chain.order.mockResolvedValueOnce({
      data: null,
      error: new Error("db error"),
    });

    await expect(getBookings()).rejects.toThrow("db error");
  });
});

describe("getBookingById", () => {
  it("returns booking with artist join", async () => {
    const chain = getChain();
    chain.maybeSingle.mockResolvedValueOnce({
      data: sampleBookingWithArtist,
      error: null,
    });

    const result = await getBookingById("booking-1");
    expect(result).toEqual(sampleBookingWithArtist);
    expect(chain.eq).toHaveBeenCalledWith("id", "booking-1");
  });

  it("returns null when not found", async () => {
    const chain = getChain();
    chain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await getBookingById("nonexistent");
    expect(result).toBeNull();
  });
});

describe("createBooking", () => {
  it("inserts and returns the new booking", async () => {
    const chain = getChain();
    chain.single.mockResolvedValueOnce({ data: sampleBooking, error: null });

    const result = await createBooking({
      artist_id: "artist-1",
      date: "2026-06-15",
      status: "enquiry",
      status_locked: false,
      deal_versus: false,
    } as Parameters<typeof createBooking>[0]);

    expect(result).toEqual(sampleBooking);
    expect(chain.insert).toHaveBeenCalled();
  });
});

describe("updateBooking", () => {
  it("updates and returns the modified booking", async () => {
    const chain = getChain();
    const updated = { ...sampleBooking, city: "Manchester" };
    chain.single.mockResolvedValueOnce({ data: updated, error: null });

    const result = await updateBooking("booking-1", { city: "Manchester" });
    expect(result.city).toBe("Manchester");
    expect(chain.eq).toHaveBeenCalledWith("id", "booking-1");
  });
});

describe("duplicateBooking", () => {
  it("fetches original, inserts copy with new date and enquiry status", async () => {
    const chain = getChain();
    // First call: getBookingById
    chain.maybeSingle.mockResolvedValueOnce({
      data: sampleBookingWithArtist,
      error: null,
    });
    // Second call: insert
    const duplicated = {
      ...sampleBooking,
      id: "booking-2",
      date: "2026-07-01",
      status: "enquiry",
    };
    chain.single.mockResolvedValueOnce({ data: duplicated, error: null });

    const result = await duplicateBooking("booking-1", "2026-07-01");
    expect(result.date).toBe("2026-07-01");
    expect(result.status).toBe("enquiry");
    expect(result.id).toBe("booking-2");
  });

  it("allows duplicating to a different artist", async () => {
    const chain = getChain();
    chain.maybeSingle.mockResolvedValueOnce({
      data: sampleBookingWithArtist,
      error: null,
    });
    chain.single.mockResolvedValueOnce({
      data: { ...sampleBooking, artist_id: "artist-2" },
      error: null,
    });

    const result = await duplicateBooking(
      "booking-1",
      "2026-07-01",
      "artist-2"
    );
    expect(result.artist_id).toBe("artist-2");
  });

  it("throws if original not found", async () => {
    const chain = getChain();
    chain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    await expect(
      duplicateBooking("nonexistent", "2026-07-01")
    ).rejects.toThrow("Booking not found");
  });
});

describe("deleteBooking", () => {
  it("deletes the booking", async () => {
    const chain = getChain();
    chain.eq.mockResolvedValueOnce({ error: null });

    await expect(deleteBooking("booking-1")).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("bookings");
    expect(chain.delete).toHaveBeenCalled();
  });

  it("throws when deletion fails", async () => {
    const chain = getChain();
    chain.eq.mockResolvedValueOnce({ error: new Error("delete failed") });

    await expect(deleteBooking("booking-1")).rejects.toThrow("delete failed");
  });
});
