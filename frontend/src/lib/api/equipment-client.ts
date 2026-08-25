import type { Equipment, EquipmentInput } from "@/types/equipment";
import { API_BASE_URL } from "@/lib/api/api-base";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

const jsonHeaders = { "Content-Type": "application/json" };

function get<T>(path: string) {
  return fetch(`${API_BASE_URL}${path}`, { credentials: "include" }).then((res) => json<T>(res));
}

function send<T>(path: string, method: string, body?: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: jsonHeaders,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then((res) => json<T>(res));
}

export function fetchMyEquipment() {
  return get<{ equipment: Equipment[] }>("/api/equipment");
}

export function createEquipmentRequest(input: Partial<EquipmentInput>) {
  return send<{ equipment: Equipment }>("/api/equipment", "POST", input);
}

export function updateEquipmentRequest(id: string, patch: Partial<EquipmentInput>) {
  return send<{ equipment: Equipment }>(`/api/equipment/${id}`, "PATCH", patch);
}

export function deleteEquipmentRequest(id: string) {
  return send<{ ok: boolean }>(`/api/equipment/${id}`, "DELETE");
}
