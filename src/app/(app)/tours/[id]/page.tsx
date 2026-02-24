"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Copy, Plus, X } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TourForm, type TourFormData } from "@/components/tours/tour-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import {
  getTourWithBookings,
  updateTour,
  deleteTour,
  duplicateTour,
  setBookingTour,
} from "@/lib/tours";
import { getArtists } from "@/lib/artists";
import { STATUS_CONFIG } from "@/lib/constants";
import type { Artist, Tour, Booking, BookingStatus } from "@/types/database";

export default function TourDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateArtistId, setDuplicateArtistId] = useState("");
  const [duplicating, setDuplicating] = useState(false);
  const [createBookingOpen, setCreateBookingOpen] = useState(false);

  useEffect(() => {
    getArtists().then((data) => setArtists(data as Artist[]));
  }, []);

  const fetchTour = useCallback(async () => {
    try {
      const result = await getTourWithBookings(params.id);
      if (result) {
        setTour(result.tour as Tour);
        setBookings(result.bookings as Booking[]);
      }
    } catch (err) {
      console.error("Failed to load tour:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchTour();
  }, [fetchTour]);

  const handleEdit = async (data: TourFormData) => {
    if (!tour) return;
    const updated = await updateTour(tour.id, {
      name: data.name,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      notes: data.notes || null,
    });
    setTour(updated as Tour);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!tour) return;
    setDeleting(true);
    try {
      await deleteTour(tour.id);
      router.push("/tours");
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!tour || !duplicateArtistId) return;
    setDuplicating(true);
    try {
      const newTour = await duplicateTour(tour.id, duplicateArtistId);
      setDuplicateOpen(false);
      router.push(`/tours/${newTour.id}`);
    } finally {
      setDuplicating(false);
    }
  };

  const handleRemoveBooking = async (bookingId: string) => {
    await setBookingTour(bookingId, null);
    await fetchTour();
  };

  const handleCreateBooking = async (artistId: string, date: string) => {
    const { createBooking } = await import("@/lib/bookings");
    const created = await createBooking({
      artist_id: artistId,
      date,
      status: "enquiry",
      status_locked: false,
      deal_versus: false,
      tour_id: tour?.id ?? null,
    });
    router.push(`/bookings/${created.id}`);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!tour) {
    return (
      <div>
        <p className="text-muted-foreground">Tour not found.</p>
        <Link href="/tours" className="mt-2 inline-block text-sm underline">
          Back to tours
        </Link>
      </div>
    );
  }

  const artist = artists.find((a) => a.id === tour.artist_id);
  const artistOptions = artists.map((a) => ({ value: a.id, label: a.name }));

  const formatDate = (d: string | null) =>
    d ? format(new Date(d), "MMM d, yyyy") : "—";

  return (
    <div>
      <Link
        href="/tours"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Tours
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-full"
            style={{ backgroundColor: artist?.color ?? "#6366f1" }}
          />
          <div>
            <h1 className="text-2xl font-semibold">{tour.name}</h1>
            <p className="text-sm text-muted-foreground">
              {artist?.name}
              {tour.start_date && tour.end_date && (
                <> &middot; {formatDate(tour.start_date)} — {formatDate(tour.end_date)}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setDuplicateArtistId(tour.artist_id);
            setDuplicateOpen(true);
          }}>
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
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
          <p className="text-xs text-muted-foreground">Dates</p>
          <p className="text-lg font-semibold">{bookings.length}</p>
        </div>
        <div className="rounded-md border border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">Period</p>
          <p className="text-sm font-medium">
            {tour.start_date ? formatDate(tour.start_date) : "TBC"} — {tour.end_date ? formatDate(tour.end_date) : "TBC"}
          </p>
        </div>
      </div>

      {tour.notes && (
        <div className="mt-4 rounded-md border border-border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Notes</h2>
          <p className="mt-1 text-sm whitespace-pre-wrap">{tour.notes}</p>
        </div>
      )}

      {/* Bookings table */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tour Dates</h2>
          <Button size="sm" onClick={() => setCreateBookingOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Date
          </Button>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-4 rounded-md border border-border p-8 text-center text-muted-foreground">
            No dates in this tour yet. Add one to get started.
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">City</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Venue</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fee</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const statusCfg = STATUS_CONFIG[booking.status as BookingStatus];
                  return (
                    <tr
                      key={booking.id}
                      className="group border-b border-border last:border-b-0 transition-colors hover:bg-accent/30 cursor-pointer"
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                    >
                      <td className="px-4 py-2 font-medium">
                        {format(new Date(booking.date), "EEE, MMM d yyyy")}
                      </td>
                      <td className="px-4 py-2">{booking.city ?? "—"}</td>
                      <td className="px-4 py-2">{booking.venue_name ?? "—"}</td>
                      <td className="px-4 py-2">
                        <Badge
                          style={{
                            backgroundColor: `${statusCfg?.color ?? "#9ca3af"}20`,
                            color: statusCfg?.color ?? "#9ca3af",
                          }}
                        >
                          {statusCfg?.label ?? booking.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {booking.fee != null
                          ? `${booking.currency ?? "GBP"} ${booking.fee.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive"
                          title="Remove from tour"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBooking(booking.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit tour dialog */}
      {editOpen && (
        <TourForm
          open={true}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          artists={artists}
          tour={tour}
        />
      )}

      {/* Duplicate tour dialog */}
      <ConfirmDialog
        open={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
        onConfirm={handleDuplicate}
        title="Duplicate Tour"
        description="Clone this tour and all its dates to another artist. All bookings will be reset to enquiry status."
        confirmLabel={duplicating ? "Duplicating..." : "Duplicate"}
        loading={duplicating}
      >
        <div className="mt-3">
          <Label htmlFor="dup-artist">Target Artist</Label>
          <Select
            id="dup-artist"
            value={duplicateArtistId}
            onChange={(e) => setDuplicateArtistId(e.target.value)}
            options={artistOptions}
            className="mt-1"
          />
        </div>
      </ConfirmDialog>

      {/* Create booking dialog */}
      <CreateBookingDialog
        open={createBookingOpen}
        onClose={() => setCreateBookingOpen(false)}
        onSubmit={handleCreateBooking}
        artists={artists}
        defaultArtistId={tour.artist_id}
      />
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
}
