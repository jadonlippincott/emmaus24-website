import type { Env } from "../_types";
import { getAuthenticatedUser } from "../_auth";

/**
 * GET /api/auth/me
 *
 * Returns the current authentication status. If the user has a valid session
 * cookie, returns { authenticated: true, username: "..." }. Otherwise returns
 * { authenticated: false }.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const username = await getAuthenticatedUser(request, env.SESSION_SECRET);

  if (username) {
    return Response.json({ authenticated: true, username });
  }

  return Response.json({ authenticated: false });
};
