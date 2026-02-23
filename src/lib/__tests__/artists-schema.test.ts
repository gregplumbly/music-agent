import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Artist } from "@/types/database";

// ---------------------------------------------------------------------------
// TypeScript type-shape checks (compile-time)
// If any property is missing or wrong type, this file will fail to typecheck.
// ---------------------------------------------------------------------------

// A valid Artist object — used to verify the type at compile time
const _artistTypeCheck = {
  id: "uuid-string" as string,
  name: "Artist Name" as string,
  slug: "artist-name" as string,
  genre: null as string | null,
  territory: null as string | null,
  color: null as string | null,
  notes: null as string | null,
  created_at: new Date().toISOString() as string,
  updated_at: new Date().toISOString() as string,
} satisfies Artist;

// ---------------------------------------------------------------------------
// Runtime tests
// ---------------------------------------------------------------------------

describe("Artist type shape", () => {
  it("has required string properties: id, name, slug, created_at, updated_at", () => {
    const artist: Artist = {
      id: "abc",
      name: "Test Artist",
      slug: "test-artist",
      genre: null,
      territory: null,
      color: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(typeof artist.id).toBe("string");
    expect(typeof artist.name).toBe("string");
    expect(typeof artist.slug).toBe("string");
    expect(typeof artist.created_at).toBe("string");
    expect(typeof artist.updated_at).toBe("string");
  });

  it("allows null for optional fields: genre, territory, color, notes", () => {
    const artist: Artist = {
      id: "abc",
      name: "Test Artist",
      slug: "test-artist",
      genre: null,
      territory: null,
      color: null,
      notes: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(artist.genre).toBeNull();
    expect(artist.territory).toBeNull();
    expect(artist.color).toBeNull();
    expect(artist.notes).toBeNull();
  });

  it("accepts string values for optional fields", () => {
    const artist: Artist = {
      id: "abc",
      name: "DJ Example",
      slug: "dj-example",
      genre: "Electronic",
      territory: "UK/EU",
      color: "#ff5500",
      notes: "Headline only",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    expect(artist.genre).toBe("Electronic");
    expect(artist.territory).toBe("UK/EU");
    expect(artist.color).toBe("#ff5500");
    expect(artist.notes).toBe("Headline only");
  });
});

// ---------------------------------------------------------------------------
// Migration SQL content checks
// ---------------------------------------------------------------------------

describe("artists migration SQL", () => {
  const repoRoot = join(import.meta.dirname, "../../..");
  const migrationPath = join(
    repoRoot,
    "supabase/migrations/20240001000000_create_artists.sql"
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

  it("creates the artists table", () => {
    expect(sql).toMatch(/CREATE TABLE.*artists/i);
  });

  it("defines all required columns", () => {
    expect(sql).toMatch(/\bid\b/);
    expect(sql).toMatch(/\bname\b/);
    expect(sql).toMatch(/\bslug\b/);
    expect(sql).toMatch(/\bcreated_at\b/);
    expect(sql).toMatch(/\bupdated_at\b/);
  });

  it("has a UNIQUE constraint on slug", () => {
    // Either inline UNIQUE or a UNIQUE INDEX on slug
    const hasInlineUnique = /slug\s+text\s+UNIQUE/i.test(sql);
    const hasUniqueIndex = /UNIQUE\s+INDEX.*slug/i.test(sql) || /UNIQUE.*\(slug\)/i.test(sql);
    expect(hasInlineUnique || hasUniqueIndex).toBe(true);
  });

  it("defines updated_at trigger function (handle_updated_at)", () => {
    expect(sql).toMatch(/handle_updated_at/i);
  });

  it("attaches trigger BEFORE UPDATE on artists", () => {
    expect(sql).toMatch(/BEFORE UPDATE ON artists/i);
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
