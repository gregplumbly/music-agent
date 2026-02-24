"use client";

import { useDroppable } from "@dnd-kit/core";
import { format, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { DraggableChip } from "./draggable-chip";
import type { CalendarBooking } from "./calendar-grid";

interface DroppableDayProps {
  day: Date;
  currentDate: Date;
  bookings: CalendarBooking[];
  showArtistName: boolean;
  onBookingClick: (booking: CalendarBooking) => void;
  onDateClick: (date: Date) => void;
}

export function DroppableDay({
  day,
  currentDate,
  bookings,
  showArtistName,
  onBookingClick,
  onDateClick,
}: DroppableDayProps) {
  const dateKey = format(day, "yyyy-MM-dd");
  const inMonth = isSameMonth(day, currentDate);

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateKey}`,
    data: { date: dateKey },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDateClick(day)}
      className={cn(
        "min-h-[100px] border-b border-r border-border p-1 cursor-pointer transition-colors",
        !inMonth && "bg-muted/30",
        isOver && "bg-accent/50 ring-2 ring-inset ring-primary/30",
        !isOver && "hover:bg-accent/30"
      )}
    >
      <div
        className={cn(
          "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs",
          isToday(day) && "bg-primary text-primary-foreground font-bold",
          !inMonth && "text-muted-foreground"
        )}
      >
        {format(day, "d")}
      </div>

      <div className="space-y-0.5">
        {bookings.slice(0, 3).map((booking) => (
          <DraggableChip
            key={booking.id}
            booking={booking}
            showArtistName={showArtistName}
            onClick={(e) => {
              e.stopPropagation();
              onBookingClick(booking);
            }}
          />
        ))}
        {bookings.length > 3 && (
          <div className="px-1 text-xs text-muted-foreground">
            +{bookings.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
