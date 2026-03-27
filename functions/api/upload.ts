import type { Env } from "./_types";
import { getAuthenticatedUser } from "./_auth";

const VALID_CATEGORIES = new Set([
  "bulletins",
  "calendars",
  "announcements",
  "sermons",
  "catechesis",
]);

/**
 * POST /api/upload
 *
 * Uploads a file to R2. Requires a valid session cookie.
 *
 * Expects multipart form data with the following fields:
 *   - file: the file to upload
 *   - category: one of bulletins, calendars, announcements, sermons, catechesis
 *   - date: a date string (e.g. "2025-01-15") used in the R2 key
 *
 * The file is stored in R2 with the key "{category}/{date}-{filename}".
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  // --- Authenticate ---
  const username = await getAuthenticatedUser(request, env.SESSION_SECRET);
  if (!username) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  // --- Parse multipart form data ---
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const category = formData.get("category");
  const date = formData.get("date");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing or invalid 'file' field." }, { status: 400 });
  }

  if (typeof category !== "string" || !VALID_CATEGORIES.has(category)) {
    return Response.json(
      {
        error: `Invalid category. Must be one of: ${[...VALID_CATEGORIES].join(", ")}`,
      },
      { status: 400 },
    );
  }

  if (typeof date !== "string" || date.length === 0) {
    return Response.json({ error: "Missing 'date' field." }, { status: 400 });
  }

  // --- Construct key and upload ---
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${category}/${date}-${sanitizedFilename}`;

  await env.R2.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
    },
    customMetadata: {
      originalName: file.name,
      uploadedBy: username,
      date,
      category,
    },
  });

  return Response.json({
    success: true,
    key,
    name: file.name,
    size: file.size,
    category,
    date,
    url: `/api/files/${encodeURIComponent(key)}`,
  });
};
