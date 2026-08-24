import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/server/current-user";
import { serverFetchJson } from "@/lib/server/backend-fetch";
import { mapBookingDoc } from "@/lib/api/booking-mapper";
import { isActive, isUpcoming } from "@/lib/data/booking-status";
import BookingCard from "@/components/account/booking-card";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingRecord } from "@/types/booking";

export const metadata: Metadata = {
  title: "My Bookings",
};

const tabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function filterByTab(bookings: BookingRecord[], tab: TabId) {
  switch (tab) {
    case "upcoming":
      return bookings.filter((b) => isUpcoming(b.status));
    case "active":
      return bookings.filter((b) => isActive(b.status));
    case "completed":
      return bookings.filter((b) => b.status === "COMPLETED");
    case "cancelled":
      return bookings.filter((b) => b.status === "CANCELLED");
  }
}

export default async function MyBookingsPage({ searchParams }: PageProps<"/account/bookings">) {
  const params = await searchParams;
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const activeTab: TabId = tabs.some((t) => t.id === requested) ? (requested as TabId) : "upcoming";

  const user = await getCurrentUser();
  if (!user) return null;

  const bookingsRes = await serverFetchJson<{ bookings: Record<string, unknown>[] }>(
    "/api/bookings?mine=true"
  );
  const bookings = (bookingsRes?.bookings ?? []).map(mapBookingDoc);
  const filtered = filterByTab(bookings, activeTab);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
          My Bookings
        </h1>
        <ButtonLink href="/book" size="md" className="hidden sm:inline-flex">
          Book a Service
        </ButtonLink>
      </div>

      <div className="mt-6 inline-flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/account/bookings?tab=${tab.id}`}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.id ? "bg-brand-600 text-white" : "text-slate-500 hover:text-navy-800"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">No {activeTab} bookings.</p>
          </div>
        ) : (
          filtered.map((record) => <BookingCard key={record.bookingReference} record={record} />)
        )}
      </div>
    </div>
  );
}
