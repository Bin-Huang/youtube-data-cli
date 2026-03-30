import type { YouTubeCredentials } from "./auth.js";
import { getAccessToken } from "./auth.js";

const DATA_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface ApiOptions {
  creds: YouTubeCredentials;
  params?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  /** Force OAuth even when api_key is available (e.g. mine=true requires it) */
  requireOAuth?: boolean;
}

export async function callApi(
  endpoint: string,
  opts: ApiOptions
): Promise<unknown> {
  const params = { ...opts.params };
  const method = opts.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Write operations always require OAuth
  const needsOAuth = opts.requireOAuth || method !== "GET" || !opts.creds.api_key;

  if (needsOAuth) {
    const token = await getAccessToken(opts.creds);
    headers.Authorization = `Bearer ${token}`;
  } else {
    params.key = opts.creds.api_key!;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  }

  const url = `${DATA_API_BASE}${endpoint}?${searchParams.toString()}`;
  const fetchOpts: RequestInit = { method, headers };

  if (opts.body && method !== "GET" && method !== "DELETE") {
    fetchOpts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, fetchOpts);

  // DELETE may return 204 No Content
  if (method === "DELETE" && res.status === 204) {
    return { deleted: true };
  }

  const json = (await res.json()) as {
    error?: { message: string; code: number };
    [key: string]: unknown;
  };

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  }

  return json;
}
