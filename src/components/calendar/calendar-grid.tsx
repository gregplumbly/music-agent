"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { BookingChip } from "./booking-chip";
import type { Booking, Artist } from "@/types/database";

export interface CalendarBooking extends Booking {
  artists: { name: string; color: string | null; slug: string } | null;
}

interface CalendarGridProps {
  currentDate: Date;
  bookings: CalendarBooking[];
  onBookingClick: (booking: CalendarBooking) => void;
  onDateClick: (date: Date) => void;
  showArtistName?: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarGrid({
  currentDate,
  bookings,
  onBookingClick,
  onDateClick,
  showArtistName = true,
}: CalendarGridProps) {
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

  return (
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
          const inMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={dateKey}
              onClick={() => onDateClick(day)}
              className={cn(
                "min-h-[100px] border-b border-r border-border p-1 cursor-pointer transition-colors hover:bg-accent/30",
                !inMonth && "bg-muted/30"
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
                {dayBookings.slice(0, 3).map((booking) => (
                  <BookingChip
                    key={booking.id}
                    booking={booking}
                    showArtistName={showArtistName}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick(booking);
                    }}
                  />
                ))}
                {dayBookings.length > 3 && (
                  <div className="px-1 text-xs text-muted-foreground">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
