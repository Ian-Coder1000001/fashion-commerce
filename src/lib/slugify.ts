/**
 * Normalizes any string into a URL-safe slug: lowercase, spaces and
 * invalid characters become hyphens, no leading/trailing/duplicate
 * hyphens. Applied server-side to every slug field so a typo like a
 * stray space can never produce a broken route.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}