"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TourForm, type TourFormData } from "@/components/tours/tour-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { listTours, createTour, deleteTour } from "@/lib/tours";
import { getArtists } from "@/lib/artists";
import type { Artist, Tour } from "@/types/database";

export default function ToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistFilter, setArtistFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getArtists().then((data) => setArtists(data as Artist[]));
  }, []);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTours(artistFilter || undefined);
      setTours(data as Tour[]);
    } catch (err) {
      console.error("Failed to fetch tours:", err);
    } finally {
      setLoading(false);
    }
  }, [artistFilter]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleCreate = async (data: TourFormData) => {
    await createTour({
      name: data.name,
      artist_id: data.artist_id,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      notes: data.notes || null,
    });
    await fetchTours();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTour(deleteTarget.id);
      setDeleteTarget(null);
      await fetchTours();
    } finally {
      setDeleting(false);
    }
  };

  const artistMap = new Map(artists.map((a) => [a.id, a]));
  const artistFilterOptions = [
    { value: "", label: "All artists" },
    ...artists.map((a) => ({ value: a.id, label: a.name })),
  ];

  const formatDateRange = (tour: Tour) => {
    if (!tour.start_date && !tour.end_date) return null;
    const start = tour.start_date ? format(new Date(tour.start_date), "MMM d, yyyy") : "?";
    const end = tour.end_date ? format(new Date(tour.end_date), "MMM d, yyyy") : "?";
    return `${start} — ${end}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tours</h1>
        <div className="flex items-center gap-3">
          <Select
            value={artistFilter}
            onChange={(e) => setArtistFilter(e.target.value)}
            options={artistFilterOptions}
            className="w-44"
          />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            New Tour
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-muted-foreground">Loading...</div>
      ) : tours.length === 0 ? (
        <div className="mt-8 text-center text-muted-foreground">
          {artistFilter ? "No tours found for this artist." : "No tours yet. Create your first one."}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {tours.map((tour) => {
            const artist = artistMap.get(tour.artist_id);
            const dateRange = formatDateRange(tour);

            return (
              <div
                key={tour.id}
                className="group flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/30 cursor-pointer"
                onClick={() => router.push(`/tours/${tour.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full shrink-0"
                    style={{ backgroundColor: artist?.color ?? "#6366f1" }}
                  />
                  <div>
                    <h3 className="font-medium">{tour.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {artist && <span>{artist.name}</span>}
                      {dateRange && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dateRange}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(tour);
                  }}
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <TourForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        artists={artists}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Tour"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Bookings linked to this tour will be unlinked but not deleted.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
