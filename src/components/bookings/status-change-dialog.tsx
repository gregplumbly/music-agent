"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";
import type { BookingStatus } from "@/types/database";

interface StatusChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (toStatus: BookingStatus, note?: string) => Promise<void>;
  currentStatus: BookingStatus;
  targetStatus: BookingStatus;
}

export function StatusChangeDialog({
  open,
  onClose,
  onConfirm,
  currentStatus,
  targetStatus,
}: StatusChangeDialogProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const needsNote =
    targetStatus === "cancelled" || targetStatus === "declined";

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm(targetStatus, note.trim() || undefined);
      setNote("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Change Status</DialogTitle>
      </DialogHeader>

      <div className="flex items-center gap-2 text-sm">
        <StatusBadge status={currentStatus} />
        <span className="text-muted-foreground">&rarr;</span>
        <StatusBadge status={targetStatus} />
      </div>

      <div className="mt-4 space-y-2">
        <Label>{needsNote ? "Reason *" : "Note (optional)"}</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            needsNote
              ? "Please provide a reason..."
              : "Optional note about this change..."
          }
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={saving || (needsNote && !note.trim())}
        >
          {saving ? "Updating..." : "Confirm"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
