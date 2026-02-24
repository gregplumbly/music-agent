"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function CalendarHeader({
  currentDate,
  onDateChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(subMonths(currentDate, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h2 className="min-w-[160px] text-center text-lg font-semibold">
        {format(currentDate, "MMMM yyyy")}
      </h2>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(addMonths(currentDate, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(new Date())}
      >
        Today
      </Button>
    </div>
  );
}
