"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Artist, Tour } from "@/types/database";

interface TourFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TourFormData) => Promise<void>;
  artists: Artist[];
  tour?: Tour | null;
  defaultArtistId?: string;
}

export interface TourFormData {
  name: string;
  artist_id: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export function TourForm({
  open,
  onClose,
  onSubmit,
  artists,
  tour,
  defaultArtistId,
}: TourFormProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(tour?.name ?? "");
  const [artistId, setArtistId] = useState(
    tour?.artist_id ?? defaultArtistId ?? artists[0]?.id ?? ""
  );
  const [startDate, setStartDate] = useState(tour?.start_date ?? "");
  const [endDate, setEndDate] = useState(tour?.end_date ?? "");
  const [notes, setNotes] = useState(tour?.notes ?? "");

  const artistOptions = artists.map((a) => ({ value: a.id, label: a.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !artistId) return;

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        artist_id: artistId,
        start_date: startDate,
        end_date: endDate,
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
        <DialogTitle>{tour ? "Edit Tour" : "New Tour"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tour-name">Tour Name *</Label>
          <Input
            id="tour-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. European Summer Tour 2026"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tour-artist">Artist *</Label>
          <Select
            id="tour-artist"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            options={artistOptions}
            disabled={!!tour}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tour-start">Start Date</Label>
            <Input
              id="tour-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tour-end">End Date</Label>
            <Input
              id="tour-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tour-notes">Notes</Label>
          <Textarea
            id="tour-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tour notes..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !name.trim() || !artistId}>
            {saving ? "Saving..." : tour ? "Save Changes" : "Create Tour"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
