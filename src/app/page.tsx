"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  MapPin,
  Music,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBookings, type BookingWithArtist } from "@/lib/bookings";
import { getArtists } from "@/lib/artists";
import { listTours } from "@/lib/tours";
import { STATUS_CONFIG } from "@/lib/constants";
import type { Artist, Tour, BookingStatus } from "@/types/database";

export default function DashboardPage() {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<BookingWithArtist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = format(new Date(), "yyyy-MM-dd");
        const [upcomingData, allBookings, artistData, tourData] =
          await Promise.all([
            getBookings({ date_from: today }),
            getBookings(),
            getArtists(),
            listTours(),
          ]);
        setUpcoming((upcomingData as BookingWithArtist[]).slice(0, 10));
        setTotalBookings(allBookings.length);
        setArtists(artistData as Artist[]);
        setTours(tourData as Tour[]);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const statusCounts = upcoming.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/artists")}>
            <Users className="h-4 w-4" />
            Artists
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/calendar")}>
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={totalBookings}
          icon={<MapPin className="h-4 w-4" />}
          href="/bookings"
        />
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          icon={<Calendar className="h-4 w-4" />}
          href="/calendar"
        />
        <StatCard
          label="Artists"
          value={artists.length}
          icon={<Users className="h-4 w-4" />}
          href="/artists"
        />
        <StatCard
          label="Tours"
          value={tours.length}
          icon={<Music className="h-4 w-4" />}
          href="/tours"
        />
      </div>

      {/* Upcoming bookings */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Upcoming Dates</h2>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-md border border-border p-8 text-center text-muted-foreground">
            No upcoming bookings.
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Artist</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Venue / City</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((booking) => {
                  const statusCfg = STATUS_CONFIG[booking.status as BookingStatus];
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-b-0 transition-colors hover:bg-accent/30 cursor-pointer"
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                    >
                      <td className="px-4 py-2 font-medium">
                        {format(new Date(booking.date), "EEE, MMM d")}
                      </td>
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: booking.artists?.color ?? "#6366f1" }}
                          />
                          {booking.artists?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {[booking.venue_name, booking.city].filter(Boolean).join(", ") || "TBC"}
                      </td>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status breakdown for upcoming */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium">Upcoming by Status</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status as BookingStatus];
              return (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cfg?.color ?? "#9ca3af" }}
                  />
                  <span className="text-sm">{cfg?.label ?? status}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border p-4 transition-colors hover:bg-accent/30"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Link>
  );
}
