"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/utils";
import type { Artist } from "@/types/database";

const PRESET_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f97316", "#a855f7",
  "#14b8a6", "#eab308", "#ec4899", "#6366f1", "#84cc16",
];

interface ArtistFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ArtistFormData) => Promise<void>;
  artist?: Artist | null;
}

export interface ArtistFormData {
  name: string;
  slug: string;
  genre: string;
  territory: string;
  color: string;
  notes: string;
}

export function ArtistForm({ open, onClose, onSubmit, artist }: ArtistFormProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(artist?.name ?? "");
  const [slug, setSlug] = useState(artist?.slug ?? "");
  const [slugManual, setSlugManual] = useState(false);
  const [genre, setGenre] = useState(artist?.genre ?? "");
  const [territory, setTerritory] = useState(artist?.territory ?? "");
  const [color, setColor] = useState(artist?.color ?? PRESET_COLORS[0]);
  const [notes, setNotes] = useState(artist?.notes ?? "");

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug || slugify(name),
        genre: genre.trim(),
        territory: territory.trim(),
        color,
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogHeader>
        <DialogTitle>{artist ? "Edit Artist" : "New Artist"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Artist name"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManual(true);
            }}
            placeholder="url-friendly-name"
          />
          <p className="text-xs text-muted-foreground">
            Auto-generated from name. Edit to override.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Electronic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="territory">Territory</Label>
            <Input
              id="territory"
              value={territory}
              onChange={(e) => setTerritory(e.target.value)}
              placeholder="e.g. Worldwide"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-10 cursor-pointer p-0.5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this artist..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? "Saving..." : artist ? "Save Changes" : "Create Artist"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
