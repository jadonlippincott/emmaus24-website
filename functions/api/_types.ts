export interface Env {
  R2: R2Bucket;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_USERS: string; // comma-separated GitHub usernames
  SESSION_SECRET: string;
}
