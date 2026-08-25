"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchAdminBookings,
  fetchAdminSupportTickets,
  resolveSupportTicketRequest,
  updateBookingStatusRequest,
  updateTechnicianRequest,
} from "@/lib/api/admin-client";
import { statusMeta } from "@/lib/data/booking-status";
import type { BookingRecord } from "@/types/booking";
import type { SupportTicket } from "@/types/account";
import type { BookingStatus } from "@/types/service";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = Object.keys(statusMeta) as BookingStatus[];

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [tab, setTab] = useState<"bookings" | "support">("bookings");

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              AGS Internal
            </p>
            <h1 className="font-display text-2xl font-extrabold text-navy-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500">Signed in as {adminName}</p>
        </div>

        <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(["bookings", "support"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === t ? "bg-brand-600 text-white" : "text-slate-500 hover:text-navy-800"
              )}
            >
              {t === "bookings" ? "Bookings" : "Support Tickets"}
            </button>
          ))}
        </div>

        <div className="mt-6">{tab === "bookings" ? <BookingsPanel /> : <SupportPanel />}</div>
      </div>
    </div>
  );
}

function BookingsPanel() {
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [savingRef, setSavingRef] = useState<string | null>(null);
  const [techDraft, setTechDraft] = useState<Record<string, { name: string; phone: string }>>({});

  const load = () =>
    fetchAdminBookings(filter || undefined).then((res) => {
      setBookings(res.bookings);
      setTechDraft((prev) => {
        const next = { ...prev };
        for (const b of res.bookings) {
          if (!next[b.bookingReference]) {
            next[b.bookingReference] = {
              name: b.technicianName ?? "",
              phone: b.technicianPhone ?? "",
            };
          }
        }
        return next;
      });
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (reference: string, status: BookingStatus) => {
    setSavingRef(reference);
    try {
      await updateBookingStatusRequest(reference, status);
      await load();
    } finally {
      setSavingRef(null);
    }
  };

  const handleTechnicianSave = async (reference: string) => {
    const draft = techDraft[reference];
    setSavingRef(reference);
    try {
      await updateTechnicianRequest(reference, draft.name || null, draft.phone || null);
      await load();
    } finally {
      setSavingRef(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold",
            filter === "" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"
          )}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              filter === s ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"
            )}
          >
            {statusMeta[s].label}
          </button>
        ))}
      </div>

      {!bookings ? (
        <div className="mt-6 flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-brand-500" />
        </div>
      ) : bookings.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No bookings match this filter.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => {
            const draft = techDraft[b.bookingReference] ?? { name: "", phone: "" };
            return (
              <div key={b.bookingReference} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {b.bookingReference}
                    </p>
                    <p className="text-sm font-bold text-navy-900">
                      {b.data.customer.fullName} &middot; {b.data.equipmentLabel}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.data.date} &middot; {b.data.timeSlot?.label} &middot; {b.data.customer.email}
                    </p>
                  </div>
                  <select
                    value={b.status}
                    disabled={savingRef === b.bookingReference}
                    onChange={(e) => handleStatusChange(b.bookingReference, e.target.value as BookingStatus)}
                    className="input-field h-9 w-auto text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusMeta[s].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <input
                    value={draft.name}
                    onChange={(e) =>
                      setTechDraft((prev) => ({
                        ...prev,
                        [b.bookingReference]: { ...prev[b.bookingReference], name: e.target.value },
                      }))
                    }
                    placeholder="Technician name"
                    className="input-field h-9 w-40 text-xs"
                  />
                  <input
                    value={draft.phone}
                    onChange={(e) =>
                      setTechDraft((prev) => ({
                        ...prev,
                        [b.bookingReference]: { ...prev[b.bookingReference], phone: e.target.value },
                      }))
                    }
                    placeholder="Technician phone"
                    className="input-field h-9 w-40 text-xs"
                  />
                  <button
                    type="button"
                    disabled={savingRef === b.bookingReference}
                    onClick={() => handleTechnicianSave(b.bookingReference)}
                    className="rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800"
                  >
                    Save Technician
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SupportPanel() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = () => fetchAdminSupportTickets().then((res) => setTickets(res.tickets));

  useEffect(() => {
    load();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveSupportTicketRequest(id);
      await load();
    } finally {
      setResolvingId(null);
    }
  };

  if (!tickets) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.length === 0 && <p className="text-sm text-slate-500">No support tickets yet.</p>}
      {tickets.map((t) => (
        <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.category.replaceAll("_", " ")}
              </p>
              <p className="text-sm font-bold text-navy-900">{t.subject}</p>
              <p className="mt-1 text-xs text-slate-500">{t.message}</p>
              <p className="mt-1 text-xs text-slate-400">{t.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  t.status === "OPEN" ? "bg-amber-50 text-amber-700" : "bg-accent-green-50 text-accent-green-700"
                )}
              >
                {t.status}
              </span>
              {t.status === "OPEN" && (
                <button
                  type="button"
                  disabled={resolvingId === t.id}
                  onClick={() => handleResolve(t.id)}
                  className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
