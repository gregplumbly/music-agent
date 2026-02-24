"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArtistForm, type ArtistFormData } from "@/components/artists/artist-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getArtistBySlug, updateArtist, deleteArtist } from "@/lib/artists";
import type { Artist } from "@/types/database";

export default function ArtistDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getArtistBySlug(params.slug);
        setArtist(data as Artist | null);
      } catch (err) {
        console.error("Failed to load artist:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

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

      {artist.notes && (
        <div className="mt-6 rounded-md border border-border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Notes</h2>
          <p className="mt-1 text-sm whitespace-pre-wrap">{artist.notes}</p>
        </div>
      )}

      <div className="mt-8 rounded-md border border-border p-6 text-center text-muted-foreground">
        <p>Artist calendar will appear here (Issue #7)</p>
      </div>

      {editOpen && (
        <ArtistForm
          open={true}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          artist={artist}
        />
      )}

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
