import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type ArtistRow    = Database["public"]["Tables"]["artists"]["Row"];
type ArtistInsert = Database["public"]["Tables"]["artists"]["Insert"];
type ArtistUpdate = Database["public"]["Tables"]["artists"]["Update"];

/**
 * Fetch all artists, optionally filtered by a search string (matches name).
 */
export async function getArtists(search?: string): Promise<ArtistRow[]> {
  let query = supabase.from("artists").select("*");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query.order("name");

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch a single artist by slug.
 */
export async function getArtistBySlug(slug: string): Promise<ArtistRow | null> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Create a new artist record.
 */
export async function createArtist(data: ArtistInsert): Promise<ArtistRow> {
  const { data: created, error } = await supabase
    .from("artists")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return created;
}

/**
 * Update an existing artist by id.
 */
export async function updateArtist(
  id: string,
  data: ArtistUpdate
): Promise<ArtistRow> {
  const { data: updated, error } = await supabase
    .from("artists")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Delete an artist by id.
 */
export async function deleteArtist(id: string): Promise<void> {
  const { error } = await supabase.from("artists").delete().eq("id", id);

  if (error) throw error;
}
