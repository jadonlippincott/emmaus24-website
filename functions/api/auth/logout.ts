import type { Env } from "../_types";
import { buildClearSessionCookie } from "../_auth";

/**
 * GET /api/auth/logout
 *
 * Clears the session cookie and redirects the user to the home page.
 */
export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": buildClearSessionCookie(),
    },
  });
};
