import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";
import { slugify } from "@/lib/utils";

// ---------------------------------------------------------------------------
// slugify unit tests
// ---------------------------------------------------------------------------

describe("slugify", () => {
  it("lowercases ASCII strings", () => {
    expect(slugify("DJ Example!")).toBe("dj-example");
  });

  it("strips diacritics and handles special chars", () => {
    expect(slugify("Röyksopp & Friends")).toBe("royksopp-friends");
  });

  it("collapses consecutive non-alphanumeric characters into a single hyphen", () => {
    expect(slugify("A   B---C")).toBe("a-b-c");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("!Hello World!")).toBe("hello-world");
  });

  it("handles already-slug strings", () => {
    expect(slugify("already-a-slug")).toBe("already-a-slug");
  });

  it("returns empty string for input that becomes all non-alphanumeric", () => {
    expect(slugify("!!!")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Artists DAL — mocked Supabase
// ---------------------------------------------------------------------------

// We need to mock the supabase module before importing artists.ts
// so the artists functions use our mock client.

vi.mock("@/lib/supabase", () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(chain),
      _chain: chain,
    },
  };
});

// Import after mock is set up
import {
  getArtists,
  getArtistBySlug,
  createArtist,
  updateArtist,
  deleteArtist,
} from "@/lib/artists";
import { supabase } from "@/lib/supabase";

// Helper to get the mocked chain
const getChain = () => (supabase as unknown as { _chain: Record<string, MockInstance> })._chain;

const sampleArtist = {
  id: "uuid-1",
  name: "DJ Example",
  slug: "dj-example",
  genre: "Electronic",
  territory: "UK",
  color: null,
  notes: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Re-wire chain: from() returns chain each call
  (supabase.from as unknown as MockInstance).mockReturnValue(getChain());
  // Set up chained methods to return `this`
  const chain = getChain();
  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.ilike.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
});

describe("getArtists", () => {
  it("returns list of artists", async () => {
    const chain = getChain();
    chain.order.mockResolvedValueOnce({ data: [sampleArtist], error: null });

    const result = await getArtists();
    expect(result).toEqual([sampleArtist]);
    expect(supabase.from).toHaveBeenCalledWith("artists");
  });

  it("applies ilike filter when search is provided", async () => {
    const chain = getChain();
    chain.order.mockResolvedValueOnce({ data: [sampleArtist], error: null });

    await getArtists("DJ");
    expect(chain.ilike).toHaveBeenCalledWith("name", "%DJ%");
  });

  it("throws when supabase returns an error", async () => {
    const chain = getChain();
    chain.order.mockResolvedValueOnce({ data: null, error: new Error("db error") });

    await expect(getArtists()).rejects.toThrow("db error");
  });
});

describe("getArtistBySlug", () => {
  it("returns artist for a given slug", async () => {
    const chain = getChain();
    chain.maybeSingle.mockResolvedValueOnce({ data: sampleArtist, error: null });

    const result = await getArtistBySlug("dj-example");
    expect(result).toEqual(sampleArtist);
    expect(chain.eq).toHaveBeenCalledWith("slug", "dj-example");
  });

  it("returns null when not found", async () => {
    const chain = getChain();
    chain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await getArtistBySlug("unknown");
    expect(result).toBeNull();
  });
});

describe("createArtist", () => {
  it("inserts and returns the new artist", async () => {
    const chain = getChain();
    chain.single.mockResolvedValueOnce({ data: sampleArtist, error: null });

    const insertData = {
      name: "DJ Example",
      slug: "dj-example",
      genre: "Electronic",
      territory: "UK",
      color: null,
      notes: null,
    };

    const result = await createArtist(insertData);
    expect(result).toEqual(sampleArtist);
    expect(chain.insert).toHaveBeenCalledWith(insertData);
  });
});

describe("updateArtist", () => {
  it("updates and returns the modified artist", async () => {
    const chain = getChain();
    const updated = { ...sampleArtist, name: "DJ Updated" };
    chain.single.mockResolvedValueOnce({ data: updated, error: null });

    const result = await updateArtist("uuid-1", { name: "DJ Updated" });
    expect(result.name).toBe("DJ Updated");
    expect(chain.eq).toHaveBeenCalledWith("id", "uuid-1");
  });
});

describe("deleteArtist", () => {
  it("deletes the artist without returning data", async () => {
    const chain = getChain();
    chain.eq.mockResolvedValueOnce({ error: null });

    await expect(deleteArtist("uuid-1")).resolves.toBeUndefined();
    expect(chain.delete).toHaveBeenCalled();
  });

  it("throws when deletion fails", async () => {
    const chain = getChain();
    chain.eq.mockResolvedValueOnce({ error: new Error("delete failed") });

    await expect(deleteArtist("uuid-1")).rejects.toThrow("delete failed");
  });
});
