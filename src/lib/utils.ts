import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string to a URL-safe slug.
 * - Lowercases the input
 * - Normalises unicode (NFD) and strips combining diacritics
 * - Replaces any sequence of non-alphanumeric characters with a single hyphen
 * - Trims leading/trailing hyphens
 *
 * @example slugify('DJ Example!')        // → 'dj-example'
 * @example slugify('Röyksopp & Friends') // → 'royksopp-friends'
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "");       // trim leading/trailing hyphens
}
