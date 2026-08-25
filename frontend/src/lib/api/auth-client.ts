import type { PublicUser } from "@/types/auth";
import { API_BASE_URL } from "@/lib/api/api-base";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error ?? "Something went wrong. Please try again.");
  }
  return body as T;
}

function post<T>(path: string, data: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  }).then((res) => json<T>(res));
}

export function registerRequest(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}) {
  return post<{ user: PublicUser }>("/api/auth/register", input);
}

export function loginRequest(input: { email: string; password: string }) {
  return post<{ user: PublicUser } | { requiresTwoFactor: true; pendingToken: string }>(
    "/api/auth/login",
    input
  );
}

export function verifyTwoFactorLoginRequest(pendingToken: string, code: string) {
  return post<{ user: PublicUser }>("/api/auth/login/2fa", { pendingToken, code });
}

export function googleAuthUrl({
  redirect = "/account",
  errorRedirect = "/login",
}: {
  redirect?: string;
  errorRedirect?: string;
} = {}) {
  const params = new URLSearchParams({ redirect, errorRedirect });
  return `${API_BASE_URL}/api/auth/google?${params}`;
}

export function logoutRequest() {
  return post<{ ok: boolean }>("/api/auth/logout", {});
}

export function meRequest() {
  return fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" }).then((res) =>
    json<{ user: PublicUser | null }>(res)
  );
}

export function forgotPasswordRequest(email: string) {
  return post<{ message: string; previewResetUrl?: string }>("/api/auth/forgot-password", {
    email,
  });
}

export function resetPasswordRequest(token: string, password: string) {
  return post<{ ok: boolean }>("/api/auth/reset-password", { token, password });
}
