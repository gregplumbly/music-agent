"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/bookings/status-badge";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { getBookings, createBooking, type BookingFilters, type BookingWithArtist } from "@/lib/bookings";
import { getArtists } from "@/lib/artists";
import { STATUS_CONFIG, DEAL_TYPE_LABELS } from "@/lib/constants";
import type { BookingStatus, Artist } from "@/types/database";
import { format } from "date-fns";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
    value,
    label,
  })),
];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithArtist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const filters: BookingFilters = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      if (artistFilter) filters.artist_id = artistFilter;
      const data = await getBookings(filters);
      setBookings(data as BookingWithArtist[]);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, artistFilter]);

  useEffect(() => {
    getArtists().then((data) => setArtists(data as Artist[]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(fetchBookings, 300);
    return () => clearTimeout(timeout);
  }, [fetchBookings]);

  const handleCreate = async (artistId: string, date: string) => {
    const created = await createBooking({
      artist_id: artistId,
      date,
      status: "enquiry",
      status_locked: false,
      deal_versus: false,
    });
    router.push(`/bookings/${created.id}`);
  };

  const artistFilterOptions = [
    { value: "", label: "All artists" },
    ...artists.map((a) => ({ value: a.id, label: a.name })),
  ];

  const formatCurrency = (fee: number | null, currency: string | null) => {
    if (fee == null) return "—";
    const symbol =
      currency === "GBP"
        ? "£"
        : currency === "EUR"
          ? "€"
          : currency === "USD"
            ? "$"
            : currency ?? "";
    return `${symbol}${fee.toLocaleString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search city, venue, promoter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_FILTER_OPTIONS}
          className="w-40"
        />
        <Select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          options={artistFilterOptions}
          className="w-48"
        />
      </div>

      {loading ? (
        <div className="mt-8 text-center text-muted-foreground">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="mt-8 text-center text-muted-foreground">
          {search || statusFilter || artistFilter
            ? "No bookings match your filters."
            : "No bookings yet. Create your first one."}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Artist</th>
                <th className="pb-2 pr-4 font-medium">City</th>
                <th className="pb-2 pr-4 font-medium">Venue</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Fee</th>
                <th className="pb-2 pr-4 font-medium">Deal</th>
                <th className="pb-2 font-medium">Promoter</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-accent/50"
                >
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    {format(new Date(booking.date), "dd MMM yyyy")}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            booking.artists?.color ?? "#6366f1",
                        }}
                      />
                      {booking.artists?.name ?? "—"}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">{booking.city ?? "—"}</td>
                  <td className="py-2.5 pr-4">{booking.venue_name ?? "—"}</td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={booking.status as BookingStatus} />
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    {formatCurrency(booking.fee, booking.currency)}
                  </td>
                  <td className="py-2.5 pr-4">
                    {booking.deal_type
                      ? DEAL_TYPE_LABELS[booking.deal_type]
                      : "—"}
                  </td>
                  <td className="py-2.5">{booking.promoter_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateBookingDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        artists={artists}
      />
    </div>
  );
}
