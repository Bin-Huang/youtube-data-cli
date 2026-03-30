import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface YouTubeCredentials {
  api_key?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
}

const DEFAULT_PATH = join(
  homedir(),
  ".config",
  "youtube-data-cli",
  "credentials.json"
);

export function loadCredentials(credentialsPath?: string): YouTubeCredentials {
  // 1. --credentials flag
  if (credentialsPath) {
    return readJSON(credentialsPath);
  }

  // 2. Environment variables
  const envCreds: YouTubeCredentials = {};
  if (process.env.YOUTUBE_API_KEY) envCreds.api_key = process.env.YOUTUBE_API_KEY;
  if (process.env.YOUTUBE_CLIENT_ID) envCreds.client_id = process.env.YOUTUBE_CLIENT_ID;
  if (process.env.YOUTUBE_CLIENT_SECRET) envCreds.client_secret = process.env.YOUTUBE_CLIENT_SECRET;
  if (process.env.YOUTUBE_REFRESH_TOKEN) envCreds.refresh_token = process.env.YOUTUBE_REFRESH_TOKEN;
  if (Object.keys(envCreds).length > 0) {
    return envCreds;
  }

  // 3. Default credentials file
  if (existsSync(DEFAULT_PATH)) {
    return readJSON(DEFAULT_PATH);
  }

  throw new Error(
    `No credentials found. Provide one of:\n` +
      `  1. --credentials <path> flag\n` +
      `  2. YOUTUBE_API_KEY and/or YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN env vars\n` +
      `  3. ${DEFAULT_PATH}`
  );
}

function readJSON(path: string): YouTubeCredentials {
  const raw = readFileSync(path, "utf-8");
  const data = JSON.parse(raw);
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(`credentials file must be a JSON object: ${path}`);
  }
  if (!data.api_key && !data.client_id) {
    throw new Error(
      `credentials file must contain at least "api_key" or "client_id": ${path}`
    );
  }
  return data;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(creds: YouTubeCredentials): Promise<string> {
  if (!creds.client_id || !creds.client_secret || !creds.refresh_token) {
    throw new Error(
      "OAuth credentials required (client_id, client_secret, refresh_token). " +
        "API key alone is not sufficient for this command."
    );
  }

  // Return cached token if still valid (with 60s buffer)
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 60_000) {
    return cachedAccessToken.token;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !json.access_token) {
    throw new Error(
      json.error_description ?? json.error ?? `Token refresh failed: HTTP ${res.status}`
    );
  }

  cachedAccessToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };

  return json.access_token;
}
