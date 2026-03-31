import type { Env } from "./_types";
import { getAuthenticatedUser } from "./_auth";

/**
 * POST /api/delete
 *
 * Deletes a file from R2. Requires a valid session cookie.
 *
 * Expects JSON body: { key: "bulletins/2025-01-15-bulletin.pdf" }
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  // --- Authenticate ---
  const username = await getAuthenticatedUser(request, env.SESSION_SECRET);
  if (!username) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  // --- Parse body ---
  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { key } = body;
  if (typeof key !== "string" || key.trim().length === 0) {
    return Response.json({ error: "Missing or empty 'key' field." }, { status: 400 });
  }

  // --- Delete from R2 ---
  await env.R2.delete(key);

  return Response.json({ success: true, key });
};
