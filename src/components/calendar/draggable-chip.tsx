"use client";

import { useDraggable } from "@dnd-kit/core";
import { STATUS_CONFIG } from "@/lib/constants";
import type { BookingStatus } from "@/types/database";
import type { CalendarBooking } from "./calendar-grid";

interface DraggableChipProps {
  booking: CalendarBooking;
  showArtistName?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export function DraggableChip({
  booking,
  showArtistName = true,
  onClick,
}: DraggableChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: booking.id,
    data: { booking },
    disabled: booking.status_locked,
  });

  const artistColor = booking.artists?.color ?? "#6366f1";
  const statusColor =
    STATUS_CONFIG[booking.status as BookingStatus]?.color ?? "#9ca3af";

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      {...listeners}
      {...attributes}
      className={`flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors hover:opacity-80 ${
        isDragging ? "opacity-40" : ""
      } ${booking.status_locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
      style={{
        backgroundColor: `${artistColor}15`,
        borderLeft: `3px solid ${artistColor}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: statusColor }}
      />
      <span className="truncate">
        {showArtistName && booking.artists?.name
          ? `${booking.artists.name} · `
          : ""}
        {booking.city ?? booking.venue_name ?? "TBC"}
      </span>
    </button>
  );
}
