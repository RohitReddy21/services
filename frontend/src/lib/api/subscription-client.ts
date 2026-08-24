import type { Subscription, SubscriptionAddress, SubscriptionFrequency } from "@/types/subscription";
import type { ServiceCategoryId } from "@/types/service";
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

export function fetchMySubscriptions() {
  return fetch(`${API_BASE_URL}/api/subscriptions`, { credentials: "include" }).then((res) =>
    json<{ subscriptions: Subscription[] }>(res)
  );
}

export function createSubscriptionRequest(input: {
  planId: string;
  planName: string;
  frequency: SubscriptionFrequency;
  categoryId: ServiceCategoryId;
  equipmentId: string;
  equipmentLabel: string;
  address: SubscriptionAddress;
  notes?: string;
}) {
  return send<{ subscription: Subscription }>("/api/subscriptions", "POST", input);
}

export function pauseSubscriptionRequest(id: string) {
  return send<{ subscription: Subscription }>(`/api/subscriptions/${id}/pause`, "POST");
}

export function resumeSubscriptionRequest(id: string) {
  return send<{ subscription: Subscription }>(`/api/subscriptions/${id}/resume`, "POST");
}

export function cancelSubscriptionRequest(id: string) {
  return send<{ subscription: Subscription }>(`/api/subscriptions/${id}/cancel`, "POST");
}
