import type { Env } from "../../types";

/**
 * Content-type mapping for common file extensions that R2 may not have
 * metadata for (e.g. if the file was uploaded without a Content-Type).
 */
const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

/**
 * GET /api/files/:key
 *
 * Serves a file from R2. The `key` parameter is the full R2 object key
 * (including the category prefix, e.g. "bulletins/2025-01-15-bulletin.pdf").
 *
 * This is a public endpoint -- no authentication is required.
 *
 * The response includes Content-Type (inferred from R2 metadata or the file
 * extension) and Content-Disposition headers.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;

  // The [key] param can be a string or string[] depending on the route. For a
  // single dynamic segment it arrives as a string, but we handle both cases.
  const rawKey = Array.isArray(params.key) ? params.key.join("/") : params.key;

  if (!rawKey) {
    return Response.json({ error: "Missing file key." }, { status: 400 });
  }

  // Decode in case the key was URL-encoded in the path
  const key = decodeURIComponent(rawKey);

  const object = await env.R2.get(key);

  if (!object) {
    return Response.json({ error: "File not found." }, { status: 404 });
  }

  // --- Determine Content-Type ---
  let contentType = object.httpMetadata?.contentType;

  if (!contentType || contentType === "application/octet-stream") {
    const extension = key.split(".").pop()?.toLowerCase();
    if (extension && extension in EXTENSION_CONTENT_TYPES) {
      contentType = EXTENSION_CONTENT_TYPES[extension];
    } else {
      contentType = "application/octet-stream";
    }
  }

  // --- Determine display name ---
  const displayName =
    object.customMetadata?.originalName ??
    key.split("/").pop() ??
    "download";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `inline; filename="${displayName}"`);
  headers.set("Cache-Control", "public, max-age=86400");

  // Forward ETag if present for caching
  if (object.etag) {
    headers.set("ETag", object.etag);
  }

  return new Response(object.body, { headers });
};
