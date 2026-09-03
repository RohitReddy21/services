"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Star,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import {
  archiveBookingRequest,
  archiveSupportTicketRequest,
  assignTechnicianRequest,
  createBookingRequest,
  createSupportTicketRequest,
  fetchAdminBookings,
  fetchAdminTechnicians,
  fetchAdminStats,
  fetchAdminSupportTickets,
  reopenSupportTicketRequest,
  resolveSupportTicketRequest,
  restoreBookingRequest,
  restoreSupportTicketRequest,
  updateBookingRequest,
  updateBookingStatusRequest,
  updateSupportTicketRequest,
  updateTechnicianRequest,
  type AdminBookingInput,
  type AdminTechnician,
} from "@/lib/api/admin-client";
import { useAuth } from "@/components/auth/auth-context";
import { statusMeta } from "@/lib/data/booking-status";
import type { BookingRecord } from "@/types/booking";
import type { SupportCategory, SupportTicket } from "@/types/account";
import type { BookingStatus, RequirementType, ServiceCategoryId } from "@/types/service";
import type { AdminStats } from "@/types/coupon";
import { cn } from "@/lib/utils";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import Logo from "@/components/navigation/logo";
import {
  AdminModal,
  ArchiveToggle,
  Field,
  FieldGrid,
  PanelHeader,
  SkeletonRows,
} from "@/components/admin/panel-shell";
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

const CATEGORY_OPTIONS: ServiceCategoryId[] = [
  "air-conditioning",
  "refrigeration",
  "electrical",
];
const REQUIREMENT_OPTIONS: RequirementType[] = [
  "installation",
  "repair",
  "servicing",
  "maintenance",
  "replacement",
  "diagnostics",
  "emergency",
  "other",
];
const CONTACT_OPTIONS = ["phone", "email", "sms"] as const;
const SUPPORT_CATEGORY_OPTIONS: SupportCategory[] = [
  "booking_help",
  "reschedule_help",
  "cancellation_help",
  "service_questions",
  "technical_questions",
  "general_enquiry",
];

type BookingFormState = {
  customerId: string;
  categoryId: ServiceCategoryId;
  equipmentId: string;
  equipmentLabel: string;
  requirement: RequirementType;
  description: string;
  date: string;
  slotLabel: string;
  slotStart: string;
  slotEnd: string;
  status: BookingStatus;
  fullName: string;
  email: string;
  phone: string;
  preferredContact: (typeof CONTACT_OPTIONS)[number];
  houseNumber: string;
  street: string;
  city: string;
  postcode: string;
  instructions: string;
};

const emptyBookingForm: BookingFormState = {
  customerId: "",
  categoryId: "air-conditioning",
  equipmentId: "",
  equipmentLabel: "",
  requirement: "repair",
  description: "",
  date: "",
  slotLabel: "",
  slotStart: "",
  slotEnd: "",
  status: "BOOKING_RECEIVED",
  fullName: "",
  email: "",
  phone: "",
  preferredContact: "phone",
  houseNumber: "",
  street: "",
  city: "",
  postcode: "",
  instructions: "",
};

function bookingFormToInput(f: BookingFormState): AdminBookingInput {
  return {
    customerId: f.customerId.trim() || null,
    categoryId: f.categoryId,
    equipmentId: f.equipmentId.trim(),
    equipmentLabel: f.equipmentLabel.trim(),
    requirement: f.requirement,
    description: f.description.trim(),
    date: f.date,
    timeSlot: {
      label: f.slotLabel.trim(),
      start: f.slotStart.trim(),
      end: f.slotEnd.trim(),
    },
    status: f.status,
    customer: {
      fullName: f.fullName.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      preferredContact: f.preferredContact,
    },
    address: {
      houseNumber: f.houseNumber.trim(),
      street: f.street.trim(),
      city: f.city.trim(),
      postcode: f.postcode.trim(),
      instructions: f.instructions.trim(),
    },
  };
}

function bookingToForm(b: BookingRecord): BookingFormState {
  return {
    customerId: b.customerId ?? "",
    categoryId: b.data.categoryId ?? "air-conditioning",
    equipmentId: b.data.equipmentId ?? "",
    equipmentLabel: b.data.equipmentLabel ?? "",
    requirement: b.data.requirement ?? "repair",
    description: b.data.description,
    date: b.data.date ?? "",
    slotLabel: b.data.timeSlot?.label ?? "",
    slotStart: b.data.timeSlot?.start ?? "",
    slotEnd: b.data.timeSlot?.end ?? "",
    status: b.status,
    fullName: b.data.customer.fullName,
    email: b.data.customer.email,
    phone: b.data.customer.phone,
    preferredContact: b.data.customer.preferredContact,
    houseNumber: b.data.address.houseNumber,
    street: b.data.address.street,
    city: b.data.address.city,
    postcode: b.data.address.postcode,
    instructions: b.data.address.instructions,
  };
}

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
          {/* A grid on small screens rather than a horizontal scroller: seven
              tabs fit on two rows, so every section is visible and tappable
              without swiping past a scrollbar. Back to a sidebar list at lg. */}
          <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:flex lg:flex-col lg:gap-1">
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              const n = badge[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "ags-focus flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-center text-xs font-semibold leading-tight transition-colors lg:flex-row lg:justify-start lg:gap-2.5 lg:px-3 lg:py-2 lg:text-left lg:text-sm",
                      active
                        ? "bg-brand-600 text-white ags-depth-sm"
                        : "text-slate-500 hover:bg-white hover:text-navy-800"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex items-center gap-1.5 lg:min-w-0 lg:flex-1">
                      <span className="lg:truncate">{label}</span>
                      {n !== undefined && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold lg:ml-auto",
                            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {n}
                        </span>
                      )}
                    </span>
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

function BookingFormFields({
  form,
  set,
  isEdit,
}: {
  form: BookingFormState;
  set: <K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) => void;
  isEdit: boolean;
}) {
  return (
    <div className="space-y-3">
      {!isEdit && (
        <Field label="Customer ID" hint="Optional — link this booking to a user account.">
          <input
            className="input-field h-9 text-sm"
            value={form.customerId}
            onChange={(e) => set("customerId", e.target.value)}
          />
        </Field>
      )}
      <FieldGrid>
        <Field label="Category">
          <select
            className="input-field h-9 text-sm"
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value as ServiceCategoryId)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Requirement">
          <select
            className="input-field h-9 text-sm"
            value={form.requirement}
            onChange={(e) => set("requirement", e.target.value as RequirementType)}
          >
            {REQUIREMENT_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Equipment ID">
          <input
            className="input-field h-9 text-sm"
            value={form.equipmentId}
            onChange={(e) => set("equipmentId", e.target.value)}
          />
        </Field>
        <Field label="Equipment label">
          <input
            className="input-field h-9 text-sm"
            value={form.equipmentLabel}
            onChange={(e) => set("equipmentLabel", e.target.value)}
          />
        </Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Date">
          <input
            type="date"
            className="input-field h-9 text-sm"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            className="input-field h-9 text-sm"
            value={form.status}
            onChange={(e) => set("status", e.target.value as BookingStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusMeta[s].label}
              </option>
            ))}
          </select>
        </Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Time slot label" hint='e.g. "Morning (9am–12pm)"'>
          <input
            className="input-field h-9 text-sm"
            value={form.slotLabel}
            onChange={(e) => set("slotLabel", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start">
            <input
              className="input-field h-9 text-sm"
              placeholder="09:00"
              value={form.slotStart}
              onChange={(e) => set("slotStart", e.target.value)}
            />
          </Field>
          <Field label="End">
            <input
              className="input-field h-9 text-sm"
              placeholder="12:00"
              value={form.slotEnd}
              onChange={(e) => set("slotEnd", e.target.value)}
            />
          </Field>
        </div>
      </FieldGrid>
      <Field label="Description">
        <textarea
          className="input-field min-h-16 text-sm"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <p className="pt-1 text-xs font-bold uppercase tracking-wide text-slate-400">Customer</p>
      <FieldGrid>
        <Field label="Full name">
          <input
            className="input-field h-9 text-sm"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            className="input-field h-9 text-sm"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className="input-field h-9 text-sm"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="Preferred contact">
          <select
            className="input-field h-9 text-sm"
            value={form.preferredContact}
            onChange={(e) =>
              set("preferredContact", e.target.value as BookingFormState["preferredContact"])
            }
          >
            {CONTACT_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </FieldGrid>

      <p className="pt-1 text-xs font-bold uppercase tracking-wide text-slate-400">Address</p>
      <FieldGrid>
        <Field label="House number">
          <input
            className="input-field h-9 text-sm"
            value={form.houseNumber}
            onChange={(e) => set("houseNumber", e.target.value)}
          />
        </Field>
        <Field label="Street">
          <input
            className="input-field h-9 text-sm"
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
          />
        </Field>
        <Field label="City">
          <input
            className="input-field h-9 text-sm"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        <Field label="Postcode">
          <input
            className="input-field h-9 text-sm"
            value={form.postcode}
            onChange={(e) => set("postcode", e.target.value)}
          />
        </Field>
      </FieldGrid>
      <Field label="Access instructions">
        <input
          className="input-field h-9 text-sm"
          value={form.instructions}
          onChange={(e) => set("instructions", e.target.value)}
        />
      </Field>
    </div>
  );
}

function BookingsPanel() {
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingRef, setSavingRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [techDraft, setTechDraft] = useState<Record<string, { name: string; phone: string }>>({});
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BookingFormState>(emptyBookingForm);
  const [editRef, setEditRef] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setRefreshing(true);
    return fetchAdminBookings({
      status: filter || undefined,
      search: search || undefined,
      includeArchived: showArchived,
    })
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
  }, [filter, search, showArchived]);

  useEffect(() => {
    const handle = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(handle);
  }, [load, search]);

  useEffect(() => {
    fetchAdminTechnicians()
      .then((res) => setTechnicians(res.technicians))
      .catch(() => setTechnicians([]));
  }, []);

  const set = <K extends keyof BookingFormState>(key: K, value: BookingFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAssign = async (reference: string, technicianId: string) => {
    setSavingRef(reference);
    setError(null);
    try {
      await assignTechnicianRequest(reference, technicianId || null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't assign that engineer.");
    } finally {
      setSavingRef(null);
    }
  };

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

  const openCreate = () => {
    setError(null);
    setEditRef(null);
    setForm(emptyBookingForm);
    setShowForm(true);
  };

  const openEdit = (b: BookingRecord) => {
    setError(null);
    setEditRef(b.bookingReference);
    setForm(bookingToForm(b));
    setShowForm(true);
  };

  const submitForm = async () => {
    const input = bookingFormToInput(form);
    if (!input.equipmentLabel || !input.customer.fullName || !input.customer.email || !input.date) {
      setError("Equipment label, customer name, email and date are required.");
      return;
    }
    if (!input.timeSlot.label || !input.timeSlot.start || !input.timeSlot.end) {
      setError("A time slot label, start and end are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editRef) {
        const { customerId: _c, ...patch } = input;
        void _c;
        await updateBookingRequest(editRef, patch);
      } else {
        await createBookingRequest(input);
      }
      setShowForm(false);
      setEditRef(null);
      setForm(emptyBookingForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the booking.");
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (b: BookingRecord) => {
    setSavingRef(b.bookingReference);
    setError(null);
    try {
      if (b.deletedAt) await restoreBookingRequest(b.bookingReference);
      else await archiveBookingRequest(b.bookingReference);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the booking.");
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
        subtitle="Create jobs, assign technicians, move them through the pipeline"
        count={bookings?.length}
        onRefresh={load}
        refreshing={refreshing}
        actions={
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <ArchiveToggle value={showArchived} onChange={setShowArchived} />
            <label className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ref, name, email…"
                className="input-field h-9 w-full pl-8 text-xs sm:w-48"
              />
            </label>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              New
            </Button>
          </div>
        }
      />

      <FilterPills options={filterOptions} value={filter} onChange={setFilter} />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

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
                className={`rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm ${
                  b.deletedAt ? "opacity-55" : ""
                }`}
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
                      {b.deletedAt && (
                        <StatusBadge tone="neutral" size="sm">
                          Archived
                        </StatusBadge>
                      )}
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

                    {b.issueNote && (
                      <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                        <span>
                          <span className="font-semibold">
                            {b.rescheduleRequested ? "Needs another visit" : "Engineer reported"}:
                          </span>{" "}
                          {b.issueNote}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <select
                      value={b.status}
                      disabled={savingRef === b.bookingReference || Boolean(b.deletedAt)}
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
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      disabled={savingRef === b.bookingReference}
                      className="ags-focus flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700 disabled:opacity-50"
                      aria-label="Edit booking"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleArchive(b)}
                      disabled={savingRef === b.bookingReference}
                      className={`ags-focus flex size-9 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                        b.deletedAt
                          ? "text-brand-600 hover:bg-brand-50"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                      aria-label={b.deletedAt ? "Restore booking" : "Archive booking"}
                    >
                      {b.deletedAt ? <RotateCcw className="size-4" /> : <Trash2 className="size-4" />}
                    </button>
                  </div>
                </div>

                {!b.deletedAt && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Engineer</span>
                      <select
                        value={b.technicianId ?? ""}
                        disabled={savingRef === b.bookingReference}
                        onChange={(e) => handleAssign(b.bookingReference, e.target.value)}
                        className="input-field h-9 w-auto text-xs"
                        aria-label="Assign engineer"
                      >
                        <option value="">Unassigned</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                            {t.avgRating ? ` · ${t.avgRating}★` : ""}
                            {t.openJobs ? ` · ${t.openJobs} open` : ""}
                          </option>
                        ))}
                      </select>
                      {technicians.length === 0 && (
                        <span className="text-xs text-slate-400">
                          No engineer accounts yet — create one under Users with the TECHNICIAN
                          role.
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Or by name</span>
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        setTechDraft((prev) => ({
                          ...prev,
                          [b.bookingReference]: {
                            ...prev[b.bookingReference],
                            name: e.target.value,
                          },
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
                          [b.bookingReference]: {
                            ...prev[b.bookingReference],
                            phone: e.target.value,
                          },
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <AdminModal
          title={editRef ? `Edit ${editRef}` : "New booking"}
          wide
          onClose={() => {
            setShowForm(false);
            setEditRef(null);
          }}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditRef(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={submitForm} disabled={saving}>
                {saving ? "Saving…" : editRef ? "Save changes" : "Create booking"}
              </Button>
            </>
          }
        >
          <BookingFormFields form={form} set={set} isEdit={Boolean(editRef)} />
        </AdminModal>
      )}
    </div>
  );
}

type TicketFormState = {
  category: SupportCategory;
  subject: string;
  message: string;
  email: string;
  status: "OPEN" | "RESOLVED";
};

const emptyTicketForm: TicketFormState = {
  category: "general_enquiry",
  subject: "",
  message: "",
  email: "",
  status: "OPEN",
};

function SupportPanel() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [filter, setFilter] = useState<"" | "OPEN" | "RESOLVED">("");
  const [showArchived, setShowArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TicketFormState>(emptyTicketForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      fetchAdminSupportTickets({ includeArchived: showArchived }).then((res) =>
        setTickets(res.tickets)
      ),
    [showArchived]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof TicketFormState>(key: K, value: TicketFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const runAction = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  const openCreate = () => {
    setError(null);
    setEditId(null);
    setForm(emptyTicketForm);
    setShowForm(true);
  };

  const openEdit = (t: SupportTicket) => {
    setError(null);
    setEditId(t.id);
    setForm({
      category: t.category,
      subject: t.subject,
      message: t.message,
      email: t.email,
      status: t.status,
    });
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!form.subject.trim() || !form.message.trim() || !form.email.trim()) {
      setError("Subject, message and email are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await updateSupportTicketRequest(editId, {
          category: form.category,
          subject: form.subject.trim(),
          message: form.message.trim(),
          email: form.email.trim(),
          status: form.status,
        });
      } else {
        await createSupportTicketRequest({
          category: form.category,
          subject: form.subject.trim(),
          message: form.message.trim(),
          email: form.email.trim(),
          status: form.status,
        });
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyTicketForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the ticket.");
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(() => {
    const list = (tickets ?? []).filter((t) => !t.deletedAt);
    return {
      open: list.filter((t) => t.status === "OPEN").length,
      resolved: list.filter((t) => t.status === "RESOLVED").length,
    };
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
        actions={
          <div className="flex items-center gap-2">
            <ArchiveToggle value={showArchived} onChange={setShowArchived} />
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              New
            </Button>
          </div>
        }
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

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      {!tickets ? (
        <SkeletonRows />
      ) : shown.length === 0 ? (
        <EmptyState message="No support tickets here." variant="card" />
      ) : (
        <div className="space-y-3">
          {shown.map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm ${
                t.deletedAt ? "opacity-55" : ""
              }`}
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
                    {t.deletedAt && (
                      <StatusBadge tone="neutral" size="sm">
                        Archived
                      </StatusBadge>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold text-navy-900">{t.subject}</p>
                  <p className="mt-1 text-sm text-slate-600">{t.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.email} · {new Date(t.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!t.deletedAt && t.status === "OPEN" && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === t.id}
                      onClick={() => runAction(t.id, () => resolveSupportTicketRequest(t.id))}
                    >
                      Resolve
                    </Button>
                  )}
                  {!t.deletedAt && t.status === "RESOLVED" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busyId === t.id}
                      onClick={() => runAction(t.id, () => reopenSupportTicketRequest(t.id))}
                    >
                      Reopen
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    disabled={busyId === t.id}
                    className="ags-focus flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700 disabled:opacity-50"
                    aria-label="Edit ticket"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runAction(t.id, () =>
                        t.deletedAt
                          ? restoreSupportTicketRequest(t.id)
                          : archiveSupportTicketRequest(t.id)
                      )
                    }
                    disabled={busyId === t.id}
                    className={`ags-focus flex size-9 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                      t.deletedAt
                        ? "text-brand-600 hover:bg-brand-50"
                        : "text-red-500 hover:bg-red-50"
                    }`}
                    aria-label={t.deletedAt ? "Restore ticket" : "Archive ticket"}
                  >
                    {t.deletedAt ? <RotateCcw className="size-4" /> : <Trash2 className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AdminModal
          title={editId ? "Edit ticket" : "New support ticket"}
          onClose={() => {
            setShowForm(false);
            setEditId(null);
          }}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={submitForm} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save changes" : "Create ticket"}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <FieldGrid>
              <Field label="Category">
                <select
                  className="input-field h-9 text-sm"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as SupportCategory)}
                >
                  {SUPPORT_CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className="input-field h-9 text-sm"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as "OPEN" | "RESOLVED")}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </Field>
            </FieldGrid>
            <Field label="Email">
              <input
                type="email"
                className="input-field h-9 text-sm"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="Subject">
              <input
                className="input-field h-9 text-sm"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </Field>
            <Field label="Message">
              <textarea
                className="input-field min-h-24 text-sm"
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </Field>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
