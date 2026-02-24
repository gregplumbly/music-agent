"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from "date-fns";
import { DroppableDay } from "./droppable-day";
import { BookingChip } from "./booking-chip";
import type { Booking } from "@/types/database";

export interface CalendarBooking extends Booking {
  artists: { name: string; color: string | null; slug: string } | null;
}

interface CalendarGridProps {
  currentDate: Date;
  bookings: CalendarBooking[];
  onBookingClick: (booking: CalendarBooking) => void;
  onDateClick: (date: Date) => void;
  onBookingMove?: (bookingId: string, newDate: string) => void;
  onBookingDuplicate?: (bookingId: string, newDate: string) => void;
  showArtistName?: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarGrid({
  currentDate,
  bookings,
  onBookingClick,
  onDateClick,
  onBookingMove,
  onBookingDuplicate,
  showArtistName = true,
}: CalendarGridProps) {
  const [activeBooking, setActiveBooking] = useState<CalendarBooking | null>(
    null
  );

  // Require 5px movement before starting drag (allows clicks to work)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const booking of bookings) {
      const key = booking.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(booking);
    }
    return map;
  }, [bookings]);

  const handleDragStart = (event: DragStartEvent) => {
    const booking = event.active.data.current?.booking as
      | CalendarBooking
      | undefined;
    if (booking) setActiveBooking(booking);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveBooking(null);
    const { active, over } = event;
    if (!over) return;

    const bookingId = active.id as string;
    const targetDate = over.data.current?.date as string | undefined;
    if (!targetDate) return;

    const booking = active.data.current?.booking as
      | CalendarBooking
      | undefined;
    if (!booking || booking.date === targetDate) return;

    // Check if Alt/Option was held during drag for duplicate
    // We track this via a keyboard state since DnD kit doesn't pass modifier keys
    if (altKeyHeld && onBookingDuplicate) {
      onBookingDuplicate(bookingId, targetDate);
    } else if (onBookingMove) {
      onBookingMove(bookingId, targetDate);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <AltKeyTracker />
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDate.get(dateKey) ?? [];

            return (
              <DroppableDay
                key={dateKey}
                day={day}
                currentDate={currentDate}
                bookings={dayBookings}
                showArtistName={showArtistName}
                onBookingClick={onBookingClick}
                onDateClick={onDateClick}
              />
            );
          })}
        </div>
      </div>

      {/* Drag overlay - shows a ghost chip while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeBooking && (
          <div className="w-[140px] opacity-80">
            <BookingChip
              booking={activeBooking}
              showArtistName={showArtistName}
              onClick={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Module-level variable to track Alt key state during drag
let altKeyHeld = false;

function AltKeyTracker() {
  if (typeof window === "undefined") return null;

  // Use event listeners to track Alt key
  // This is a lightweight approach that avoids re-renders
  if (!(window as unknown as { __altTrackerSet?: boolean }).__altTrackerSet) {
    (window as unknown as { __altTrackerSet?: boolean }).__altTrackerSet = true;
    window.addEventListener("keydown", (e) => {
      if (e.altKey) altKeyHeld = true;
    });
    window.addEventListener("keyup", (e) => {
      if (!e.altKey) altKeyHeld = false;
    });
  }

  return null;
}
