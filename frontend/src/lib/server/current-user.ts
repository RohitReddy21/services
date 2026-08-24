import type { PublicUser } from "@/types/auth";
import { serverFetchJson } from "@/lib/server/backend-fetch";

/** For use in Server Components / Pages — calls the real backend's /api/auth/me. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const result = await serverFetchJson<{ user: PublicUser | null }>("/api/auth/me");
  return result?.user ?? null;
}
