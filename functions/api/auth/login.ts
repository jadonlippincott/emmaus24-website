import type { Env } from "../_types";
import { buildStateCookie } from "../_auth";

/**
 * GET /api/auth/login
 *
 * Initiates the GitHub OAuth flow by generating a random state parameter,
 * storing it in a cookie, and redirecting the browser to GitHub's authorize
 * endpoint.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  // Generate a cryptographically random state parameter
  const stateBytes = new Uint8Array(32);
  crypto.getRandomValues(stateBytes);
  const state = Array.from(stateBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Determine the redirect URI from the current request origin
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;

  // Build the GitHub OAuth authorization URL
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
    scope: "read:user",
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: githubAuthUrl,
      "Set-Cookie": buildStateCookie(state),
    },
  });
};
