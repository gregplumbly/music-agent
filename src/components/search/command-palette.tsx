"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, MapPin, Music, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getArtists } from "@/lib/artists";
import { getBookings, type BookingWithArtist } from "@/lib/bookings";
import { listTours } from "@/lib/tours";
import type { Artist, Tour } from "@/types/database";

interface SearchResult {
  id: string;
  type: "artist" | "booking" | "tour";
  title: string;
  subtitle: string;
  href: string;
  color?: string | null;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase();
        const [artists, bookings, tours] = await Promise.all([
          getArtists(query),
          getBookings({ search: query }),
          listTours(),
        ]);

        const items: SearchResult[] = [];

        for (const a of artists as Artist[]) {
          items.push({
            id: a.id,
            type: "artist",
            title: a.name,
            subtitle: [a.genre, a.territory].filter(Boolean).join(" · ") || "Artist",
            href: `/artists/${a.slug}`,
            color: a.color,
          });
        }

        for (const b of bookings as BookingWithArtist[]) {
          items.push({
            id: b.id,
            type: "booking",
            title: [b.artists?.name, b.city ?? b.venue_name].filter(Boolean).join(" — ") || "Booking",
            subtitle: `${b.date} · ${b.status}`,
            href: `/bookings/${b.id}`,
            color: b.artists?.color,
          });
        }

        for (const t of tours as Tour[]) {
          if (t.name.toLowerCase().includes(q)) {
            items.push({
              id: t.id,
              type: "tour",
              title: t.name,
              subtitle: "Tour",
              href: `/tours/${t.id}`,
            });
          }
        }

        setResults(items.slice(0, 20));
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(result.href);
    },
    [onClose, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  const typeIcon = (type: string) => {
    switch (type) {
      case "artist":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case "booking":
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
      case "tour":
        return <Music className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-background shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search artists, bookings, venues, tours..."
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <span className="text-xs text-muted-foreground">Searching...</span>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((result, i) => (
              <button
                key={`${result.type}-${result.id}`}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  i === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {result.color ? (
                  <span
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: result.color }}
                  />
                ) : (
                  typeIcon(result.type)
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{result.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {result.subtitle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {result.type}
                </span>
              </button>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No results found.
          </div>
        )}

        {!query && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Start typing to search...
          </div>
        )}
      </div>
    </div>
  );
}
