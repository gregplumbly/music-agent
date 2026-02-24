import { supabase } from "@/lib/supabase";
import type { Booking, BookingStatus } from "@/types/database";

export interface BookingWithArtist extends Booking {
  artists: { name: string; color: string | null; slug: string } | null;
}

export interface BookingFilters {
  artist_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

/**
 * Fetch bookings with optional filters, joined with artist name and color.
 */
export async function getBookings(
  filters?: BookingFilters
): Promise<BookingWithArtist[]> {
  let query = supabase
    .from("bookings")
    .select("*, artists(name, color, slug)");

  if (filters?.artist_id) {
    query = query.eq("artist_id", filters.artist_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status as BookingStatus);
  }
  if (filters?.date_from) {
    query = query.gte("date", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("date", filters.date_to);
  }
  if (filters?.search) {
    query = query.or(
      `city.ilike.%${filters.search}%,venue_name.ilike.%${filters.search}%,promoter_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error) throw error;
  // Cast needed because Supabase can't infer relationship without full schema generation
  return (data ?? []) as unknown as BookingWithArtist[];
}

/**
 * Fetch a single booking by ID, joined with artist.
 */
export async function getBookingById(
  id: string
): Promise<BookingWithArtist | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, artists(name, color, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as BookingWithArtist | null;
}

/**
 * Create a new booking. Required fields: artist_id, date, status, status_locked, deal_versus.
 * All other booking fields are optional (nullable).
 */
export async function createBooking(data: {
  artist_id: string;
  date: string;
  status: BookingStatus;
  status_locked: boolean;
  deal_versus: boolean;
  [key: string]: unknown;
}): Promise<Booking> {
  const { data: created, error } = await supabase
    .from("bookings")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return created as unknown as Booking;
}

/**
 * Update a booking by ID.
 */
export async function updateBooking(
  id: string,
  data: Record<string, unknown>
): Promise<Booking> {
  const { data: updated, error } = await supabase
    .from("bookings")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updated as unknown as Booking;
}

/**
 * Duplicate a booking with a new date. Resets status to enquiry.
 */
export async function duplicateBooking(
  id: string,
  newDate: string,
  newArtistId?: string
): Promise<Booking> {
  const original = await getBookingById(id);
  if (!original) throw new Error("Booking not found");

  const {
    id: _id,
    created_at: _ca,
    updated_at: _ua,
    day_of_week: _dow,
    artists: _artists,
    status: _status,
    status_locked: _locked,
    ...rest
  } = original;

  return createBooking({
    ...rest,
    date: newDate,
    artist_id: newArtistId ?? original.artist_id,
    status: "enquiry" as const,
    status_locked: false,
    deal_versus: rest.deal_versus ?? false,
  });
}

/**
 * Delete a booking by ID.
 */
export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}
