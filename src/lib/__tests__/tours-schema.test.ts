import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Tour } from "@/types/database";

// ---------------------------------------------------------------------------
// TypeScript type-shape checks (compile-time)
// If any property is missing or wrong type, this file will fail to typecheck.
// ---------------------------------------------------------------------------

// A valid Tour object — used to verify the type at compile time
const _tourTypeCheck = {
  id: "uuid-string" as string,
  name: "Summer Tour 2024" as string,
  artist_id: "artist-uuid" as string,
  start_date: null as string | null,
  end_date: null as string | null,
  notes: null as string | null,
  created_at: new Date().toISOString() as string,
} satisfies Tour;

// ---------------------------------------------------------------------------
// Runtime tests
// ---------------------------------------------------------------------------

describe("Tour type shape", () => {
  it("has required string properties: id, name, artist_id, created_at", () => {
    const tour: Tour = {
      id: "abc",
      name: "Summer Tour 2024",
      artist_id: "artist-abc",
      start_date: null,
      end_date: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
    };

    expect(typeof tour.id).toBe("string");
    expect(typeof tour.name).toBe("string");
    expect(typeof tour.artist_id).toBe("string");
    expect(typeof tour.created_at).toBe("string");
  });

  it("allows null for optional fields: start_date, end_date, notes", () => {
    const tour: Tour = {
      id: "abc",
      name: "Autumn Run",
      artist_id: "artist-abc",
      start_date: null,
      end_date: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
    };

    expect(tour.start_date).toBeNull();
    expect(tour.end_date).toBeNull();
    expect(tour.notes).toBeNull();
  });

  it("accepts string values for optional date and notes fields", () => {
    const tour: Tour = {
      id: "abc",
      name: "Winter Tour",
      artist_id: "artist-abc",
      start_date: "2024-12-01",
      end_date: "2024-12-31",
      notes: "European leg only",
      created_at: "2024-01-01T00:00:00Z",
    };

    expect(tour.start_date).toBe("2024-12-01");
    expect(tour.end_date).toBe("2024-12-31");
    expect(tour.notes).toBe("European leg only");
  });

  it("artist_id links tour to an artist", () => {
    const artistId = "artist-xyz-123";
    const tour: Tour = {
      id: "tour-abc",
      name: "Festival Run",
      artist_id: artistId,
      start_date: "2024-06-01",
      end_date: "2024-08-31",
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
    };

    expect(tour.artist_id).toBe(artistId);
  });
});

// ---------------------------------------------------------------------------
// Migration SQL content checks
// ---------------------------------------------------------------------------

describe("tours migration SQL", () => {
  const repoRoot = join(import.meta.dirname, "../../..");
  const migrationPath = join(
    repoRoot,
    "supabase/migrations/20240002000000_create_tours.sql"
  );
  let sql: string;

  try {
    sql = readFileSync(migrationPath, "utf-8");
  } catch {
    sql = "";
  }

  it("migration file exists and is non-empty", () => {
    expect(sql.length).toBeGreaterThan(0);
  });

  it("creates the tours table", () => {
    expect(sql).toMatch(/CREATE TABLE.*tours/i);
  });

  it("defines all required columns", () => {
    expect(sql).toMatch(/\bid\b/);
    expect(sql).toMatch(/\bname\b/);
    expect(sql).toMatch(/\bartist_id\b/);
    expect(sql).toMatch(/\bstart_date\b/);
    expect(sql).toMatch(/\bend_date\b/);
    expect(sql).toMatch(/\bnotes\b/);
    expect(sql).toMatch(/\bcreated_at\b/);
  });

  it("has FK to artists(id) with ON DELETE CASCADE", () => {
    expect(sql).toMatch(/REFERENCES\s+artists\s*\(\s*id\s*\)/i);
    expect(sql).toMatch(/ON DELETE CASCADE/i);
  });

  it("defines an index on artist_id", () => {
    expect(sql).toMatch(/CREATE INDEX.*tours_artist_id_idx.*ON\s+tours\s*\(\s*artist_id\s*\)/i);
  });

  it("enables RLS", () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/i);
  });

  it("has an allow_all policy", () => {
    expect(sql).toMatch(/CREATE POLICY.*allow_all/i);
    expect(sql).toMatch(/USING\s*\(\s*true\s*\)/i);
    expect(sql).toMatch(/WITH CHECK\s*\(\s*true\s*\)/i);
  });
});
