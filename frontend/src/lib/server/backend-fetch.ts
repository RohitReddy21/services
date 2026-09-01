import { cookies } from "next/headers";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(
  /\/+$/,
  ""
);

// The backend runs on a platform that can cold-start (spun-down free instance),
// where the first request may take 30-60s. Without a bound, that stalls the
// whole server render — and eventually the platform kills it with a 504. A
// timeout lets the page fall back to its logged-out / empty state instead of
// hanging. Generous enough to ride out a warm-but-slow response.
const DEFAULT_TIMEOUT_MS = 12_000;

/**
 * Server Components can't rely on the browser to attach cookies when calling
 * a cross-origin backend, so this reads the incoming request's cookie jar and
 * forwards it explicitly as a `Cookie` header.
 */
export async function serverFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestInit } = init ?? {};

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      ...requestInit.headers,
      cookie: cookieHeader,
    },
    cache: "no-store",
    signal: requestInit.signal ?? AbortSignal.timeout(timeoutMs),
  });

  return res;
}

export async function serverFetchJson<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T | null> {
  try {
    const res = await serverFetch(path, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network error, abort/timeout, or malformed JSON — treat as "no data" so
    // the caller renders its fallback rather than throwing the whole route.
    return null;
  }
}
