import type { Env } from "../types";

const VALID_CATEGORIES = new Set([
  "bulletins",
  "calendars",
  "announcements",
  "sermons",
  "catechesis",
]);

/**
 * GET /api/files?category=bulletins
 *
 * Lists files stored in R2 under the given category prefix. This is a public
 * endpoint -- no authentication is required.
 *
 * Returns a JSON array of objects:
 *   { key, name, url, uploaded, size }
 *
 * Results are sorted by key descending so that the newest dates appear first
 * (keys are formatted as "{category}/{date}-{filename}").
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);

  const category = url.searchParams.get("category");

  if (!category || !VALID_CATEGORIES.has(category)) {
    return Response.json(
      {
        error: `Missing or invalid 'category' query parameter. Must be one of: ${[...VALID_CATEGORIES].join(", ")}`,
      },
      { status: 400 },
    );
  }

  const prefix = `${category}/`;
  const listed = await env.R2.list({ prefix });

  const files = listed.objects.map((obj) => {
    // Derive a human-readable name: strip the category prefix and the leading
    // date portion (e.g. "2025-01-15-") to get the original filename, falling
    // back to the custom metadata if available.
    const keyWithoutPrefix = obj.key.slice(prefix.length);
    const name =
      obj.customMetadata?.originalName ??
      // Strip a leading YYYY-MM-DD- pattern
      keyWithoutPrefix.replace(/^\d{4}-\d{2}-\d{2}-/, "");

    return {
      key: obj.key,
      name,
      url: `/api/files/${encodeURIComponent(obj.key)}`,
      uploaded: obj.uploaded.toISOString(),
      size: obj.size,
    };
  });

  // Sort by key descending -- since keys start with a date, this yields
  // newest-first ordering.
  files.sort((a, b) => b.key.localeCompare(a.key));

  return Response.json(files);
};
