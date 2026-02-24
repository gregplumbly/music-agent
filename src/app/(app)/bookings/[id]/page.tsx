"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Trash2, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BookingForm } from "@/components/bookings/booking-form";
import { StatusDropdown } from "@/components/bookings/status-dropdown";
import { StatusChangeDialog } from "@/components/bookings/status-change-dialog";
import { StatusHistory } from "@/components/bookings/status-history";
import { getBookingById, updateBooking, deleteBooking, duplicateBooking } from "@/lib/bookings";
import { changeBookingStatus, unlockBooking } from "@/lib/status";
import { getArtists } from "@/lib/artists";
import type { Booking, BookingStatus, Artist } from "@/types/database";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [artistName, setArtistName] = useState<string>("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<BookingStatus | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [bookingData, artistsData] = await Promise.all([
          getBookingById(params.id),
          getArtists(),
        ]);
        if (bookingData) {
          const { artists: artist, ...rest } = bookingData;
          setBooking(rest as Booking);
          setArtistName(artist?.name ?? "Unknown Artist");
        }
        setArtists(artistsData as Artist[]);
      } catch (err) {
        console.error("Failed to load booking:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleSave = useCallback(
    async (field: string, value: unknown) => {
      if (!booking) return;
      try {
        const updated = await updateBooking(booking.id, {
          [field]: value,
        });
        setBooking(updated as Booking);
      } catch (err) {
        console.error("Failed to save:", err);
      }
    },
    [booking]
  );

  const handleStatusChange = async (
    toStatus: BookingStatus,
    note?: string
  ) => {
    if (!booking) return;
    try {
      const result = await changeBookingStatus(
        booking.id,
        booking.status,
        toStatus,
        note
      );
      setBooking((prev) =>
        prev
          ? { ...prev, status: result.status, status_locked: result.status_locked }
          : null
      );
      setHistoryKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  };

  const handleUnlock = async () => {
    if (!booking) return;
    try {
      await unlockBooking(booking.id);
      setBooking((prev) => (prev ? { ...prev, status_locked: false } : null));
      setUnlockOpen(false);
    } catch (err) {
      console.error("Failed to unlock:", err);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    setDeleting(true);
    try {
      await deleteBooking(booking.id);
      router.push("/bookings");
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!booking) return;
    try {
      const dup = await duplicateBooking(booking.id, booking.date);
      router.push(`/bookings/${dup.id}`);
    } catch (err) {
      console.error("Failed to duplicate:", err);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!booking) {
    return (
      <div>
        <p className="text-muted-foreground">Booking not found.</p>
        <Link href="/bookings" className="mt-2 inline-block text-sm underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Bookings
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{artistName}</h1>
            <StatusDropdown
              status={booking.status}
              isLocked={booking.status_locked}
              onSelect={(s) => setStatusTarget(s)}
            />
            {booking.status_locked && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {[booking.city, booking.venue_name, booking.date]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="flex gap-2">
          {booking.status_locked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnlockOpen(true)}
            >
              <Unlock className="h-4 w-4" />
              Unlock
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleSave("status_locked", true)
              }
            >
              <Lock className="h-4 w-4" />
              Lock
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <BookingForm
          booking={booking}
          artists={artists}
          onSave={handleSave}
          disabled={booking.status_locked}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Status History
        </h2>
        <StatusHistory bookingId={booking.id} refreshKey={historyKey} />
      </div>

      {statusTarget && (
        <StatusChangeDialog
          open={true}
          onClose={() => setStatusTarget(null)}
          onConfirm={handleStatusChange}
          currentStatus={booking.status}
          targetStatus={statusTarget}
        />
      )}

      <ConfirmDialog
        open={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        onConfirm={handleUnlock}
        title="Unlock Booking"
        description="Are you sure you want to unlock this booking? This will allow status and field changes."
        confirmLabel="Unlock"
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
