import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Server Components can't rely on the browser to attach cookies when calling
 * a cross-origin backend, so this reads the incoming request's cookie jar and
 * forwards it explicitly as a `Cookie` header.
 */
export async function serverFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  return res;
}

export async function serverFetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await serverFetch(path, init);
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}
