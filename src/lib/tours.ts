import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type TourRow    = Database["public"]["Tables"]["tours"]["Row"];
type TourInsert = Database["public"]["Tables"]["tours"]["Insert"];
type TourUpdate = Database["public"]["Tables"]["tours"]["Update"];
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export type Tour    = TourRow;
export type Booking = BookingRow;

/**
 * List all tours, optionally filtered by artist.
 */
export async function listTours(artistId?: string): Promise<Tour[]> {
  let query = supabase.from("tours").select("*");

  if (artistId) {
    query = query.eq("artist_id", artistId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch a single tour together with all its bookings.
 */
export async function getTourWithBookings(
  id: string
): Promise<{ tour: Tour; bookings: Booking[] } | null> {
  const [tourResult, bookingsResult] = await Promise.all([
    supabase.from("tours").select("*").eq("id", id).maybeSingle(),
    supabase.from("bookings").select("*").eq("tour_id", id).order("date"),
  ]);

  if (tourResult.error) throw tourResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  if (!tourResult.data) return null;

  return {
    tour: tourResult.data,
    bookings: bookingsResult.data ?? [],
  };
}

/**
 * Create a new tour record.
 */
export async function createTour(data: TourInsert): Promise<Tour> {
  const { data: created, error } = await supabase
    .from("tours")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update an existing tour by id.
 */
export async function updateTour(id: string, data: TourUpdate): Promise<Tour> {
  const { data: updated, error } = await supabase
    .from("tours")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Delete a tour by id.
 */
export async function deleteTour(id: string): Promise<void> {
  const { error } = await supabase.from("tours").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Assign a booking to a tour (or unassign by passing null).
 */
export async function setBookingTour(
  bookingId: string,
  tourId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({ tour_id: tourId })
    .eq("id", bookingId);

  if (error) throw error;
}

/**
 * Duplicate a tour (and its bookings) to a target artist.
 * All cloned bookings have status reset to 'enquiry' and status_locked to false.
 */
export async function duplicateTour(
  tourId: string,
  targetArtistId: string
): Promise<Tour> {
  // 1. Fetch the source tour + bookings
  const source = await getTourWithBookings(tourId);
  if (!source) throw new Error(`Tour ${tourId} not found`);

  // 2. Clone the tour — build an explicit TourInsert object
  const tourInsert: TourInsert = {
    name: source.tour.name,
    artist_id: targetArtistId,
    start_date: source.tour.start_date,
    end_date: source.tour.end_date,
    notes: source.tour.notes,
  };

  const { data: newTour, error: tourError } = await supabase
    .from("tours")
    .insert(tourInsert)
    .select()
    .single();

  if (tourError) throw tourError;

  // 3. Clone each booking (reset status / status_locked, re-assign to new artist + tour)
  if (source.bookings.length > 0) {
    type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];

    const clonedBookings: BookingInsert[] = source.bookings.map((b) => ({
      artist_id: targetArtistId,
      tour_id: newTour.id,
      status: "enquiry" as const,
      status_locked: false,
      date: b.date,
      country: b.country,
      city: b.city,
      venue_name: b.venue_name,
      venue_capacity: b.venue_capacity,
      room: b.room,
      room_capacity: b.room_capacity,
      currency: b.currency,
      fee: b.fee,
      deal_type: b.deal_type,
      deal_percentage: b.deal_percentage,
      deal_versus: b.deal_versus,
      expenses: b.expenses,
      buyout: b.buyout,
      add_ons: b.add_ons,
      billing: b.billing,
      set_length: b.set_length,
      set_time: b.set_time,
      promoter_name: b.promoter_name,
      promoter_email: b.promoter_email,
      promoter_company: b.promoter_company,
      previous_artists: b.previous_artists,
      artists_booked: b.artists_booked,
      notes: b.notes,
    }));

    const { error: bookingsError } = await supabase
      .from("bookings")
      .insert(clonedBookings);

    if (bookingsError) throw bookingsError;
  }

  return newTour;
}
