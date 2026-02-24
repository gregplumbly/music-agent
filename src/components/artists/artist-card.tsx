"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Artist } from "@/types/database";

interface ArtistCardProps {
  artist: Artist;
  onEdit: (artist: Artist) => void;
  onDelete: (artist: Artist) => void;
}

export function ArtistCard({ artist, onEdit, onDelete }: ArtistCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="group relative rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent/50">
      <div className="flex items-start justify-between">
        <Link href={`/artists/${artist.slug}`} className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full shrink-0"
              style={{ backgroundColor: artist.color ?? "#6366f1" }}
            />
            <div>
              <h3 className="font-medium">{artist.name}</h3>
              <p className="text-sm text-muted-foreground">
                {[artist.genre, artist.territory].filter(Boolean).join(" · ") ||
                  "No details"}
              </p>
            </div>
          </div>
        </Link>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-36 rounded-md border border-border bg-background py-1 shadow-md">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(artist);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(artist);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-accent"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
