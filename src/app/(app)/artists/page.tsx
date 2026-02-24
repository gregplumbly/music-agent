"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArtistCard } from "@/components/artists/artist-card";
import { ArtistForm, type ArtistFormData } from "@/components/artists/artist-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getArtists, createArtist, updateArtist, deleteArtist } from "@/lib/artists";
import type { Artist } from "@/types/database";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArtists = useCallback(async () => {
    try {
      const data = await getArtists(search || undefined);
      setArtists(data as Artist[]);
    } catch (err) {
      console.error("Failed to fetch artists:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchArtists, 300);
    return () => clearTimeout(timeout);
  }, [fetchArtists]);

  const handleCreate = async (data: ArtistFormData) => {
    await createArtist({
      name: data.name,
      slug: data.slug,
      genre: data.genre || null,
      territory: data.territory || null,
      color: data.color || null,
      notes: data.notes || null,
    });
    await fetchArtists();
  };

  const handleEdit = async (data: ArtistFormData) => {
    if (!editingArtist) return;
    await updateArtist(editingArtist.id, {
      name: data.name,
      slug: data.slug,
      genre: data.genre || null,
      territory: data.territory || null,
      color: data.color || null,
      notes: data.notes || null,
    });
    setEditingArtist(null);
    await fetchArtists();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteArtist(deleteTarget.id);
      setDeleteTarget(null);
      await fetchArtists();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Artists</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          New Artist
        </Button>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="mt-8 text-center text-muted-foreground">Loading...</div>
      ) : artists.length === 0 ? (
        <div className="mt-8 text-center text-muted-foreground">
          {search ? "No artists found." : "No artists yet. Create your first one."}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onEdit={(a) => setEditingArtist(a)}
              onDelete={(a) => setDeleteTarget(a)}
            />
          ))}
        </div>
      )}

      <ArtistForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      {editingArtist && (
        <ArtistForm
          open={true}
          onClose={() => setEditingArtist(null)}
          onSubmit={handleEdit}
          artist={editingArtist}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Artist"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all their bookings.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
