"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Artist } from "@/types/database";

interface CreateBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (artistId: string, date: string) => Promise<void>;
  artists: Artist[];
  defaultArtistId?: string;
  defaultDate?: string;
}

export function CreateBookingDialog({
  open,
  onClose,
  onSubmit,
  artists,
  defaultArtistId,
  defaultDate,
}: CreateBookingDialogProps) {
  const [artistId, setArtistId] = useState(defaultArtistId ?? "");
  const [date, setDate] = useState(defaultDate ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId || !date) return;
    setSaving(true);
    try {
      await onSubmit(artistId, date);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-sm">
      <DialogHeader>
        <DialogTitle>New Booking</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Artist *</Label>
          <Select
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            options={artists.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="Select artist"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !artistId || !date}>
            {saving ? "Creating..." : "Create Booking"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
