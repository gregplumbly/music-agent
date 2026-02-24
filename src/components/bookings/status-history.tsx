"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "./status-badge";
import { getStatusHistory } from "@/lib/status";
import { format } from "date-fns";
import type { BookingStatus, BookingStatusLog } from "@/types/database";

interface StatusHistoryProps {
  bookingId: string;
  refreshKey?: number;
}

export function StatusHistory({ bookingId, refreshKey }: StatusHistoryProps) {
  const [history, setHistory] = useState<BookingStatusLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStatusHistory(bookingId);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load status history:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId, refreshKey]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading history...</p>;
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No status changes yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-border" />
          <div className="flex-1 text-sm">
            <div className="flex items-center gap-2">
              {entry.from_status && (
                <>
                  <StatusBadge
                    status={entry.from_status as BookingStatus}
                  />
                  <span className="text-muted-foreground">&rarr;</span>
                </>
              )}
              <StatusBadge status={entry.to_status as BookingStatus} />
            </div>
            {entry.note && (
              <p className="mt-1 text-muted-foreground">{entry.note}</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {format(new Date(entry.changed_at), "dd MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
