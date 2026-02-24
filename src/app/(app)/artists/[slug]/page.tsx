"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArtistForm, type ArtistFormData } from "@/components/artists/artist-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CalendarGrid, type CalendarBooking } from "@/components/calendar/calendar-grid";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { getArtistBySlug, updateArtist, deleteArtist, getArtists } from "@/lib/artists";
import { getBookings, createBooking, updateBooking, duplicateBooking } from "@/lib/bookings";
import type { Artist } from "@/types/database";

export default function ArtistDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string>("");

  // Stats
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [data, artists] = await Promise.all([
          getArtistBySlug(params.slug),
          getArtists(),
        ]);
        setArtist(data as Artist | null);
        setAllArtists(artists as Artist[]);
      } catch (err) {
        console.error("Failed to load artist:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

  const fetchBookings = useCallback(async () => {
    if (!artist) return;
    setBookingsLoading(true);
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const data = await getBookings({
        artist_id: artist.id,
        date_from: format(monthStart, "yyyy-MM-dd"),
        date_to: format(monthEnd, "yyyy-MM-dd"),
      });
      setBookings(data as CalendarBooking[]);
      const allBookings = await getBookings({ artist_id: artist.id });
      setTotalBookings(allBookings.length);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, [artist, currentDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleEdit = async (data: ArtistFormData) => {
    if (!artist) return;
    const updated = await updateArtist(artist.id, {
      name: data.name,
      slug: data.slug,
      genre: data.genre || null,
      territory: data.territory || null,
      color: data.color || null,
      notes: data.notes || null,
    });
    setArtist(updated as Artist);
    setEditOpen(false);
    if (data.slug !== params.slug) {
      router.replace(`/artists/${data.slug}`);
    }
  };

  const handleDelete = async () => {
    if (!artist) return;
    setDeleting(true);
    try {
      await deleteArtist(artist.id);
      router.push("/artists");
    } finally {
      setDeleting(false);
    }
  };

  const handleBookingMove = async (bookingId: string, newDate: string) => {
    try {
      await updateBooking(bookingId, { date: newDate });
      await fetchBookings();
    } catch (err) {
      console.error("Failed to move booking:", err);
    }
  };

  const handleBookingDuplicate = async (bookingId: string, newDate: string) => {
    try {
      await duplicateBooking(bookingId, newDate);
      await fetchBookings();
    } catch (err) {
      console.error("Failed to duplicate booking:", err);
    }
  };

  const handleBookingClick = (booking: CalendarBooking) => {
    router.push(`/bookings/${booking.id}`);
  };

  const handleDateClick = (date: Date) => {
    setCreateDate(format(date, "yyyy-MM-dd"));
    setCreateOpen(true);
  };

  const handleCreateBooking = async (artistId: string, date: string) => {
    const created = await createBooking({
      artist_id: artistId,
      date,
      status: "enquiry",
      status_locked: false,
      deal_versus: false,
    });
    router.push(`/bookings/${created.id}`);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!artist) {
    return (
      <div>
        <p className="text-muted-foreground">Artist not found.</p>
        <Link href="/artists" className="mt-2 inline-block text-sm underline">
          Back to artists
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/artists"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Artists
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-full"
            style={{ backgroundColor: artist.color ?? "#6366f1" }}
          />
          <div>
            <h1 className="text-2xl font-semibold">{artist.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[artist.genre, artist.territory].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
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

      {/* Quick stats */}
      <div className="mt-4 flex gap-4">
        <div className="rounded-md border border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">Total Bookings</p>
          <p className="text-lg font-semibold">{totalBookings}</p>
        </div>
        <div className="rounded-md border border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="text-lg font-semibold">{bookings.length}</p>
        </div>
      </div>

      {artist.notes && (
        <div className="mt-4 rounded-md border border-border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Notes</h2>
          <p className="mt-1 text-sm whitespace-pre-wrap">{artist.notes}</p>
        </div>
      )}

      {/* Artist calendar */}
      <div className="mt-6">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
        <div className="mt-3 rounded-lg border border-border">
          {bookingsLoading ? (
            <div className="flex h-[500px] items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <CalendarGrid
              currentDate={currentDate}
              bookings={bookings}
              onBookingClick={handleBookingClick}
              onDateClick={handleDateClick}
              onBookingMove={handleBookingMove}
              onBookingDuplicate={handleBookingDuplicate}
              showArtistName={false}
            />
          )}
        </div>
      </div>

      {editOpen && (
        <ArtistForm
          open={true}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          artist={artist}
        />
      )}

      <CreateBookingDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateBooking}
        artists={allArtists}
        defaultArtistId={artist.id}
        defaultDate={createDate}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Artist"
        description={`Are you sure you want to delete "${artist.name}"? This will also delete all their bookings.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
