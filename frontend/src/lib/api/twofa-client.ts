import { API_BASE_URL } from "@/lib/api/api-base";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

function send<T>(path: string, body?: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then((res) => json<T>(res));
}

export function setupTwoFactorRequest() {
  return send<{ qrCodeDataUrl: string; secret: string }>("/api/2fa/setup");
}

export function enableTwoFactorRequest(code: string) {
  return send<{ backupCodes: string[] }>("/api/2fa/enable", { code });
}

export function disableTwoFactorRequest(password: string) {
  return send<{ ok: boolean }>("/api/2fa/disable", { password });
}
