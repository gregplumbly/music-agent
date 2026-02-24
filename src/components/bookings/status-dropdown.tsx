"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { STATUS_CONFIG } from "@/lib/constants";
import { getAvailableTransitions } from "@/lib/status";
import type { BookingStatus } from "@/types/database";

interface StatusDropdownProps {
  status: BookingStatus;
  isLocked: boolean;
  onSelect: (status: BookingStatus) => void;
}

export function StatusDropdown({
  status,
  isLocked,
  onSelect,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const transitions = getAvailableTransitions(status, isLocked);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => !isLocked && setOpen(!open)}
        className={`inline-flex items-center gap-1 ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        disabled={isLocked}
      >
        <StatusBadge status={status} />
        {!isLocked && <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </button>

      {open && transitions.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-background py-1 shadow-lg">
          {transitions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setOpen(false);
                onSelect(s);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_CONFIG[s].color }}
              />
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
