/**
 * Shared authentication utilities for Cloudflare Pages Functions.
 *
 * Session tokens are structured as: base64(payload) + "." + base64(signature)
 * where payload is JSON { username, exp } and signature is HMAC-SHA256
 * of the payload using SESSION_SECRET.
 */

const SESSION_COOKIE = "emmaus_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ---------------------------------------------------------------------------
// Low-level crypto helpers (Web Crypto API)
// ---------------------------------------------------------------------------

async function getSigningKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  // Restore standard base64 characters and padding
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Token creation & verification
// ---------------------------------------------------------------------------

export async function createSessionToken(
  username: string,
  secret: string,
): Promise<string> {
  const payload = JSON.stringify({
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });

  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);
  const payloadB64 = toBase64Url(payloadBytes.buffer);

  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);
  const signatureB64 = toBase64Url(signature);

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<{ username: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;

  try {
    const payloadBytes = fromBase64Url(payloadB64);
    const signatureBytes = fromBase64Url(signatureB64);

    const key = await getSigningKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      payloadBytes,
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    // Check expiry
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (typeof payload.username !== "string" || payload.username.length === 0) {
      return null;
    }

    return { username: payload.username };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const [rawName, ...rawVal] = pair.split("=");
    const name = rawName?.trim();
    if (name) {
      cookies[name] = rawVal.join("=").trim();
    }
  }
  return cookies;
}

/**
 * Extract and validate the session cookie from an incoming request.
 * Returns the authenticated username or null.
 */
export async function getAuthenticatedUser(
  request: Request,
  secret: string,
): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = parseCookies(cookieHeader);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const result = await verifySessionToken(token, secret);
  return result?.username ?? null;
}

/**
 * Build a Set-Cookie header value that sets the session token.
 */
export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

/**
 * Build a Set-Cookie header value that clears the session token.
 */
export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/**
 * Build a Set-Cookie header value for the OAuth state parameter.
 */
export function buildStateCookie(state: string): string {
  return `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
}

/**
 * Read the OAuth state parameter from cookies.
 */
export function getStateCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  return cookies["oauth_state"] ?? null;
}

/**
 * Build a Set-Cookie header that clears the OAuth state cookie.
 */
export function buildClearStateCookie(): string {
  return "oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
