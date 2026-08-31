"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Phone,
  Repeat,
  Search,
  Star,
  Tag,
  Users,
} from "lucide-react";
import {
  fetchAdminBookings,
  fetchAdminStats,
  fetchAdminSupportTickets,
  resolveSupportTicketRequest,
  updateBookingStatusRequest,
  updateTechnicianRequest,
} from "@/lib/api/admin-client";
import { useAuth } from "@/components/auth/auth-context";
import { statusMeta } from "@/lib/data/booking-status";
import type { BookingRecord } from "@/types/booking";
import type { SupportTicket } from "@/types/account";
import type { BookingStatus } from "@/types/service";
import type { AdminStats } from "@/types/coupon";
import { cn } from "@/lib/utils";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import Logo from "@/components/navigation/logo";
import { PanelHeader, SkeletonRows } from "@/components/admin/panel-shell";
import OverviewPanel from "@/components/admin/overview-panel";
import UsersPanel from "@/components/admin/users-panel";
import SubscriptionsPanel from "@/components/admin/subscriptions-panel";
import ReviewsPanel from "@/components/admin/reviews-panel";
import CouponsPanel from "@/components/admin/coupons-panel";

const STATUS_OPTIONS = Object.keys(statusMeta) as BookingStatus[];

const BOOKING_TONE: Record<BookingStatus, BadgeTone> = {
  BOOKING_RECEIVED: "warning",
  CONFIRMED: "brand",
  TECHNICIAN_ASSIGNED: "brand",
  TECHNICIAN_ARRIVING: "brand",
  SERVICE_STARTED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarClock },
  { id: "subscriptions", label: "Care Plans", icon: Repeat },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "users", label: "Users", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "coupons", label: "Coupons", icon: Tag },
] as const;

type Tab = (typeof NAV)[number]["id"];

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [counts, setCounts] = useState<AdminStats | null>(null);

  const loadCounts = useCallback(() => {
    fetchAdminStats().then(setCounts).catch(() => setCounts(null));
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts, tab]);

  const badge: Partial<Record<Tab, number>> = {
    bookings: counts?.bookings.total,
    subscriptions: counts?.subscriptions.active,
    support: counts?.tickets.open,
    users: counts?.users.total,
    reviews: counts?.reviews.count,
    coupons: counts?.coupons.active,
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo showTagline={false} className="scale-90 origin-left" />
            <span className="hidden rounded-full bg-navy-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white sm:inline">
              Admin Console
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {adminName}
            </span>
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {adminName.charAt(0).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="ags-focus inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:text-red-600"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav className="lg:w-56 lg:shrink-0">
          <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              const n = badge[id];
              return (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "ags-focus flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-brand-600 text-white ags-depth-sm"
                        : "text-slate-500 hover:bg-white hover:text-navy-800"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{label}</span>
                    {n !== undefined && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {n}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          {tab === "overview" && <OverviewPanel onJump={(t) => setTab(t as Tab)} />}
          {tab === "bookings" && <BookingsPanel />}
          {tab === "support" && <SupportPanel />}
          {tab === "subscriptions" && <SubscriptionsPanel />}
          {tab === "users" && <UsersPanel />}
          {tab === "reviews" && <ReviewsPanel />}
          {tab === "coupons" && <CouponsPanel />}
        </main>
      </div>
    </div>
  );
}

function BookingsPanel() {
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [savingRef, setSavingRef] = useState<string | null>(null);
  const [techDraft, setTechDraft] = useState<Record<string, { name: string; phone: string }>>({});

  const load = useCallback(() => {
    setRefreshing(true);
    return fetchAdminBookings({ status: filter || undefined, search: search || undefined })
      .then((res) => {
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
      })
      .finally(() => setRefreshing(false));
  }, [filter, search]);

  useEffect(() => {
    const handle = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(handle);
  }, [load, search]);

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

  const filterOptions = [
    { value: "", label: "All" },
    ...STATUS_OPTIONS.map((s) => ({ value: s, label: statusMeta[s].label })),
  ];

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Bookings"
        subtitle="Assign technicians and move jobs through the pipeline"
        count={bookings?.length}
        onRefresh={load}
        refreshing={refreshing}
        actions={
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref, name, email…"
              className="input-field h-9 w-52 pl-8 text-xs"
            />
          </label>
        }
      />

      <FilterPills options={filterOptions} value={filter} onChange={setFilter} />

      {!bookings ? (
        <SkeletonRows />
      ) : bookings.length === 0 ? (
        <EmptyState message="No bookings match this filter." variant="card" />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const draft = techDraft[b.bookingReference] ?? { name: "", phone: "" };
            const meta = statusMeta[b.status];
            const addr = b.data.address;
            return (
              <div
                key={b.bookingReference}
                className="rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-500">
                        {b.bookingReference}
                      </span>
                      <StatusBadge tone={BOOKING_TONE[b.status] ?? "neutral"} size="sm">
                        {meta?.label ?? b.status}
                      </StatusBadge>
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-navy-900">
                      {b.data.customer.fullName} &middot; {b.data.equipmentLabel}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.data.date} &middot; {b.data.timeSlot?.label}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                      <span>{b.data.customer.email}</span>
                      {b.data.customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3" />
                          {b.data.customer.phone}
                        </span>
                      )}
                      {addr && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {[addr.houseNumber, addr.street, addr.city, addr.postcode]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={b.status}
                    disabled={savingRef === b.bookingReference}
                    onChange={(e) =>
                      handleStatusChange(b.bookingReference, e.target.value as BookingStatus)
                    }
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
                  <span className="text-xs font-semibold text-slate-400">Technician</span>
                  <input
                    value={draft.name}
                    onChange={(e) =>
                      setTechDraft((prev) => ({
                        ...prev,
                        [b.bookingReference]: { ...prev[b.bookingReference], name: e.target.value },
                      }))
                    }
                    placeholder="Name"
                    className="input-field h-9 w-36 text-xs"
                  />
                  <input
                    value={draft.phone}
                    onChange={(e) =>
                      setTechDraft((prev) => ({
                        ...prev,
                        [b.bookingReference]: { ...prev[b.bookingReference], phone: e.target.value },
                      }))
                    }
                    placeholder="Phone"
                    className="input-field h-9 w-36 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={savingRef === b.bookingReference}
                    onClick={() => handleTechnicianSave(b.bookingReference)}
                  >
                    Save
                  </Button>
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
  const [filter, setFilter] = useState<"" | "OPEN" | "RESOLVED">("");
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = useCallback(
    () => fetchAdminSupportTickets().then((res) => setTickets(res.tickets)),
    []
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveSupportTicketRequest(id);
      await load();
    } finally {
      setResolvingId(null);
    }
  };

  const counts = useMemo(() => {
    const open = tickets?.filter((t) => t.status === "OPEN").length ?? 0;
    const resolved = tickets?.filter((t) => t.status === "RESOLVED").length ?? 0;
    return { open, resolved };
  }, [tickets]);

  const shown = (tickets ?? []).filter((t) => !filter || t.status === filter);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Support tickets"
        subtitle={`${counts.open} open · ${counts.resolved} resolved`}
        count={shown.length}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <FilterPills
        options={[
          { value: "", label: "All" },
          { value: "OPEN", label: `Open (${counts.open})` },
          { value: "RESOLVED", label: `Resolved (${counts.resolved})` },
        ]}
        value={filter}
        onChange={(v) => setFilter(v as typeof filter)}
      />

      {!tickets ? (
        <SkeletonRows />
      ) : shown.length === 0 ? (
        <EmptyState message="No support tickets here." variant="card" />
      ) : (
        <div className="space-y-3">
          {shown.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {t.category.replaceAll("_", " ")}
                    </span>
                    <StatusBadge tone={t.status === "OPEN" ? "warning" : "success"} size="sm">
                      {t.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm font-bold text-navy-900">{t.subject}</p>
                  <p className="mt-1 text-sm text-slate-600">{t.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.email} · {new Date(t.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                {t.status === "OPEN" && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={resolvingId === t.id}
                    onClick={() => handleResolve(t.id)}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
