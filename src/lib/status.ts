import { supabase } from "@/lib/supabase";
import type { BookingStatus, BookingStatusLog } from "@/types/database";

/** Ordered statuses for the normal forward flow */
const STATUS_ORDER: BookingStatus[] = [
  "enquiry",
  "hold",
  "offered",
  "pending",
  "confirmed",
  "contracted",
  "advanced",
  "settled",
];

/** Statuses that can be set from any other status */
const ALWAYS_AVAILABLE: BookingStatus[] = ["cancelled", "declined"];

/** Statuses from which the booking auto-locks */
const AUTO_LOCK_STATUSES: BookingStatus[] = [
  "contracted",
  "advanced",
  "settled",
];

/**
 * Get valid next statuses for a booking given its current status and lock state.
 * - Before contracted: can move freely forward/backward through the order.
 * - At or after contracted: locked by default. If unlocked, same rules apply.
 * - Cancelled/declined available from any status.
 */
export function getAvailableTransitions(
  currentStatus: BookingStatus,
  isLocked: boolean
): BookingStatus[] {
  if (isLocked) return [];

  return [...STATUS_ORDER, ...ALWAYS_AVAILABLE].filter(
    (s) => s !== currentStatus
  );
}

/**
 * Whether a status should auto-lock the booking.
 */
export function shouldAutoLock(status: BookingStatus): boolean {
  return AUTO_LOCK_STATUSES.includes(status);
}

/**
 * Change a booking's status with audit logging.
 * Returns the updated booking fields.
 */
export async function changeBookingStatus(
  bookingId: string,
  fromStatus: BookingStatus,
  toStatus: BookingStatus,
  note?: string
): Promise<{ status: BookingStatus; status_locked: boolean }> {
  const autoLock = shouldAutoLock(toStatus);

  // Update the booking
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: toStatus,
      status_locked: autoLock,
    })
    .eq("id", bookingId);

  if (updateError) throw updateError;

  // Log the status change
  const { error: logError } = await supabase
    .from("booking_status_log")
    .insert({
      booking_id: bookingId,
      from_status: fromStatus,
      to_status: toStatus,
      note: note || null,
    });

  if (logError) throw logError;

  return { status: toStatus, status_locked: autoLock };
}

/**
 * Fetch status history for a booking, newest first.
 */
export async function getStatusHistory(
  bookingId: string
): Promise<BookingStatusLog[]> {
  const { data, error } = await supabase
    .from("booking_status_log")
    .select("*")
    .eq("booking_id", bookingId)
    .order("changed_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as BookingStatusLog[];
}

/**
 * Unlock a booking (set status_locked = false).
 */
export async function unlockBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({ status_locked: false })
    .eq("id", bookingId);

  if (error) throw error;
}
