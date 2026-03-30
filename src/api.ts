import { readFileSync } from "fs";
import type { YouTubeCredentials } from "./auth.js";
import { getAccessToken } from "./auth.js";

const DATA_API_BASE = "https://www.googleapis.com/youtube/v3";
const UPLOAD_API_BASE = "https://www.googleapis.com/upload/youtube/v3";

export interface ApiOptions {
  creds: YouTubeCredentials;
  params?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  /** Force OAuth even when api_key is available (e.g. mine=true requires it) */
  requireOAuth?: boolean;
  /** Return raw Response instead of parsed JSON (for binary downloads) */
  rawResponse?: boolean;
}

export interface UploadOptions {
  creds: YouTubeCredentials;
  endpoint: string;
  params?: Record<string, string>;
  method?: "POST" | "PUT";
  filePath: string;
  contentType: string;
  body?: Record<string, unknown>;
}

function buildSearchParams(params: Record<string, string>): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  }
  return searchParams;
}

async function getAuthHeaders(opts: ApiOptions, method: string): Promise<{ headers: Record<string, string>; params: Record<string, string> }> {
  const params = { ...opts.params };
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const needsOAuth = opts.requireOAuth || method !== "GET" || !opts.creds.api_key;

  if (needsOAuth) {
    const token = await getAccessToken(opts.creds);
    headers.Authorization = `Bearer ${token}`;
  } else {
    params.key = opts.creds.api_key!;
  }

  return { headers, params };
}

export async function callApi(
  endpoint: string,
  opts: ApiOptions
): Promise<unknown> {
  const method = opts.method ?? "GET";
  const { headers, params } = await getAuthHeaders(opts, method);

  const searchParams = buildSearchParams(params);
  const url = `${DATA_API_BASE}${endpoint}?${searchParams.toString()}`;
  const fetchOpts: RequestInit = { method, headers };

  if (opts.body && method !== "GET" && method !== "DELETE") {
    fetchOpts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, fetchOpts);

  // POST with 204 (rate) or DELETE with 204
  if (res.status === 204) {
    return { success: true };
  }

  if (opts.rawResponse) {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res;
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

/** Upload a file using multipart upload (metadata + file content) */
export async function uploadFile(opts: UploadOptions): Promise<unknown> {
  const token = await getAccessToken(opts.creds);
  const method = opts.method ?? "POST";
  const params = { ...opts.params, uploadType: "multipart" };

  const searchParams = buildSearchParams(params);
  const url = `${UPLOAD_API_BASE}${opts.endpoint}?${searchParams.toString()}`;

  const fileContent = readFileSync(opts.filePath);
  const boundary = "----YouTubeDataCLIBoundary" + Date.now();

  const metadataPart = opts.body ? JSON.stringify(opts.body) : "{}";
  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
    `${metadataPart}\r\n`,
    `--${boundary}\r\n`,
    `Content-Type: ${opts.contentType}\r\n\r\n`,
  ];

  const textEncoder = new TextEncoder();
  const headerBytes = textEncoder.encode(bodyParts.join(""));
  const footerBytes = textEncoder.encode(`\r\n--${boundary}--`);

  const bodyBuffer = new Uint8Array(headerBytes.length + fileContent.length + footerBytes.length);
  bodyBuffer.set(headerBytes, 0);
  bodyBuffer.set(fileContent, headerBytes.length);
  bodyBuffer.set(footerBytes, headerBytes.length + fileContent.length);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: bodyBuffer,
  });

  if (res.status === 204) {
    return { success: true };
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

/** Upload a file using simple media upload (file content only, no metadata) */
export async function uploadFileSimple(opts: UploadOptions): Promise<unknown> {
  const token = await getAccessToken(opts.creds);
  const method = opts.method ?? "POST";
  const params = { ...opts.params, uploadType: "media" };

  const searchParams = buildSearchParams(params);
  const url = `${UPLOAD_API_BASE}${opts.endpoint}?${searchParams.toString()}`;

  const fileContent = readFileSync(opts.filePath);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": opts.contentType,
    },
    body: fileContent,
  });

  if (res.status === 204) {
    return { success: true };
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
