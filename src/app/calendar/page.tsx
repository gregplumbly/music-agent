"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { CalendarGrid, type CalendarBooking } from "@/components/calendar/calendar-grid";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { Select } from "@/components/ui/select";
import { getBookings } from "@/lib/bookings";
import { getArtists } from "@/lib/artists";
import { STATUS_CONFIG } from "@/lib/constants";
import type { Artist } from "@/types/database";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
    value,
    label,
  })),
];

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistFilter, setArtistFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string>("");

  useEffect(() => {
    getArtists().then((data) => setArtists(data as Artist[]));
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const data = await getBookings({
        date_from: format(monthStart, "yyyy-MM-dd"),
        date_to: format(monthEnd, "yyyy-MM-dd"),
        artist_id: artistFilter || undefined,
        status: statusFilter || undefined,
      });
      setBookings(data as CalendarBooking[]);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, artistFilter, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleBookingClick = (booking: CalendarBooking) => {
    router.push(`/bookings/${booking.id}`);
  };

  const handleDateClick = (date: Date) => {
    setCreateDate(format(date, "yyyy-MM-dd"));
    setCreateOpen(true);
  };

  const handleCreateBooking = async (artistId: string, date: string) => {
    const { createBooking } = await import("@/lib/bookings");
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_FILTER_OPTIONS}
            className="w-36"
          />
          <Select
            value={artistFilter}
            onChange={(e) => setArtistFilter(e.target.value)}
            options={artistFilterOptions}
            className="w-44"
          />
        </div>
      </div>

      <div className="mt-4">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      </div>

      <div className="mt-4 rounded-lg border border-border">
        {loading ? (
          <div className="flex h-[600px] items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onDateClick={handleDateClick}
            showArtistName={true}
          />
        )}
      </div>

      <CreateBookingDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateBooking}
        artists={artists}
        defaultDate={createDate}
      />
    </div>
  );
}
