import type { BookingRecord } from "@/types/booking";
import { API_BASE_URL } from "@/lib/api/api-base";
import { mapBookingDoc } from "@/lib/api/booking-mapper";

/** Statuses an engineer can set from the field. */
export type TechnicianStatus = "TECHNICIAN_ARRIVING" | "SERVICE_STARTED" | "COMPLETED";

export type JobScope = "today" | "upcoming" | "completed";

export interface JobSummary {
  today: number;
  upcoming: number;
  completed: number;
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
  return body as T;
}

function get<T>(path: string) {
  return fetch(`${API_BASE_URL}${path}`, { credentials: "include" }).then((res) => json<T>(res));
}

function send<T>(path: string, method: string, body?: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then((res) => json<T>(res));
}

export function fetchTechnicianJobs(scope: JobScope) {
  return get<{ jobs: Record<string, unknown>[]; today: string }>(
    `/api/technician/jobs?scope=${scope}`
  ).then((res) => ({ jobs: res.jobs.map(mapBookingDoc), today: res.today }));
}

export function fetchJobSummary() {
  return get<JobSummary>("/api/technician/jobs/summary");
}

export function fetchTechnicianJob(reference: string) {
  return get<{ job: Record<string, unknown> }>(`/api/technician/jobs/${reference}`).then((res) =>
    mapBookingDoc(res.job)
  );
}

export function updateJobStatusRequest(reference: string, status: TechnicianStatus) {
  return send<{ job: Record<string, unknown> }>(
    `/api/technician/jobs/${reference}/status`,
    "PATCH",
    { status }
  ).then((res) => mapBookingDoc(res.job));
}

export function completeJobRequest(
  reference: string,
  input: { notes: string; photos?: { name: string; url: string }[]; complete?: boolean }
) {
  return send<{ job: Record<string, unknown> }>(
    `/api/technician/jobs/${reference}/completion`,
    "POST",
    { complete: true, photos: [], ...input }
  ).then((res) => mapBookingDoc(res.job));
}

/** The next status an engineer can move a job to, or null if it's their last step. */
export function nextStatus(current: BookingRecord["status"]): TechnicianStatus | null {
  switch (current) {
    case "CONFIRMED":
    case "TECHNICIAN_ASSIGNED":
      return "TECHNICIAN_ARRIVING";
    case "TECHNICIAN_ARRIVING":
      return "SERVICE_STARTED";
    case "SERVICE_STARTED":
      return "COMPLETED";
    default:
      return null;
  }
}

export const NEXT_STATUS_LABEL: Record<TechnicianStatus, string> = {
  TECHNICIAN_ARRIVING: "On my way",
  SERVICE_STARTED: "Start work",
  COMPLETED: "Complete job",
};
