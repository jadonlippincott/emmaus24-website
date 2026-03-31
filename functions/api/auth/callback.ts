import type { Env } from "../_types";
import {
  getStateCookie,
  buildClearStateCookie,
  createSessionToken,
  buildSessionCookie,
} from "../_auth";

/**
 * GET /api/auth/callback
 *
 * Handles the GitHub OAuth callback. Validates the state parameter, exchanges
 * the authorization code for an access token, fetches the user's GitHub
 * profile, and checks whether the username appears in the ALLOWED_USERS
 * environment variable. If authorized, a signed session cookie is set and the
 * user is redirected to /admin.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
  const { env, request } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // --- Validate state parameter ---
  if (!code || !state) {
    return new Response("Missing code or state parameter.", { status: 400 });
  }

  const expectedState = getStateCookie(request);
  if (!expectedState || expectedState !== state) {
    return new Response("Invalid or missing OAuth state. Please try logging in again.", {
      status: 403,
    });
  }

  // --- Exchange code for access token ---
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/auth/callback`,
    }),
  });

  if (!tokenResponse.ok) {
    return new Response("Failed to exchange authorization code for access token.", {
      status: 502,
    });
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    const msg = tokenData.error_description || tokenData.error || "Unknown error";
    return new Response(`GitHub OAuth error: ${msg}`, { status: 502 });
  }

  // --- Fetch user profile ---
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "emmaus24-website",
    },
  });

  if (!userResponse.ok) {
    return new Response("Failed to fetch GitHub user profile.", { status: 502 });
  }

  const userData = (await userResponse.json()) as { login?: string };
  const username = userData.login;

  if (!username) {
    return new Response("Could not determine GitHub username.", { status: 502 });
  }

  // --- Check authorization (must be a repo collaborator with push access) ---
  const repoResponse = await fetch(
    "https://api.github.com/repos/jadonlippincott/emmaus24-website",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "emmaus24-website",
      },
    },
  );

  if (!repoResponse.ok) {
    return new Response("Failed to verify repository access.", { status: 502 });
  }

  const repoData = (await repoResponse.json()) as {
    permissions?: { push?: boolean };
  };

  if (!repoData.permissions?.push) {
    return new Response(
      `Access denied. The GitHub user "${username}" is not a collaborator on the emmaus24-website repository.`,
      {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "Set-Cookie": buildClearStateCookie(),
        },
      },
    );
  }

  // --- Create session & redirect ---
  const sessionToken = await createSessionToken(username, env.SESSION_SECRET);

  const headers = new Headers();
  headers.set("Location", "/admin");
  headers.append("Set-Cookie", buildSessionCookie(sessionToken));
  headers.append("Set-Cookie", buildClearStateCookie());

  return new Response(null, { status: 302, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Auth callback error: ${message}`, { status: 500 });
  }
};
