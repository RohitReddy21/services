import type { WaitlistEntry } from "@/types/waitlist";
import { API_BASE_URL } from "@/lib/api/api-base";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

function send<T>(path: string, method: string, body?: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then((res) => json<T>(res));
}

export function joinWaitlistRequest(input: {
  date: string;
  slotId: string;
  slotLabel: string;
  categoryId: string;
  equipmentId: string;
  equipmentLabel: string;
}) {
  return send<{ entry: WaitlistEntry }>("/api/waitlist", "POST", input);
}

export function fetchMyWaitlist() {
  return fetch(`${API_BASE_URL}/api/waitlist/mine`, { credentials: "include" }).then((res) =>
    json<{ entries: WaitlistEntry[] }>(res)
  );
}

export function leaveWaitlistRequest(id: string) {
  return send<{ ok: boolean }>(`/api/waitlist/${id}`, "DELETE");
}
