import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Calendar, CheckCircle2, MapPin, Sparkles, Wrench } from "lucide-react";
import { getCurrentUser } from "@/lib/server/current-user";
import { serverFetchJson } from "@/lib/server/backend-fetch";
import { mapBookingDoc } from "@/lib/api/booking-mapper";
import { isUpcoming } from "@/lib/data/booking-status";
import BookingCard from "@/components/account/booking-card";
import { ButtonLink } from "@/components/ui/button";
import type { Notification } from "@/types/account";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null; // guarded by layout

  const [bookingsRes, notificationsRes, loyaltyRes] = await Promise.all([
    serverFetchJson<{ bookings: Record<string, unknown>[] }>("/api/bookings?mine=true"),
    serverFetchJson<{ notifications: Notification[] }>("/api/account/notifications"),
    serverFetchJson<{ balance: number }>("/api/loyalty"),
  ]);

  const bookings = (bookingsRes?.bookings ?? []).map(mapBookingDoc);
  const upcoming = bookings.filter((b) => isUpcoming(b.status));
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const notifications = notificationsRes?.notifications ?? [];
  const unread = notifications.filter((n) => !n.read);
  const points = loyaltyRes?.balance ?? 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
        Welcome back, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Here&apos;s an overview of your account.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard icon={Calendar} value={upcoming.length} label="Upcoming Bookings" />
        <StatCard icon={CheckCircle2} value={completed.length} label="Completed" />
        <StatCard icon={Bell} value={unread.length} label="Unread" />
        <StatCard icon={Sparkles} value={points} label="Reward Points" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <QuickAction href="/book" icon={Wrench} label="Book a Service" />
        <QuickAction href="/account/bookings" icon={Calendar} label="View Bookings" />
        <QuickAction href="/account/addresses" icon={MapPin} label="Manage Addresses" />
        <QuickAction href="/account/rewards" icon={Sparkles} label="Rewards" />
        <QuickAction href="/account/support" icon={Bell} label="Contact Support" />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy-900">Upcoming Booking</h2>
          <Link href="/account/bookings" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View All
          </Link>
        </div>

        <div className="mt-4">
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-8 text-center shadow-sm shadow-brand-100">
              <p className="text-sm text-slate-500">You have no upcoming bookings.</p>
              <ButtonLink href="/book" size="md" className="mt-4">
                Book a Service
              </ButtonLink>
            </div>
          ) : (
            <BookingCard record={upcoming[0]} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 text-center shadow-sm shadow-brand-100 sm:p-5">
      <Icon className="mx-auto size-5 text-brand-500" />
      <p className="mt-2 font-display text-2xl font-extrabold text-navy-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-slate-500 sm:text-xs">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="ags-focus flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm shadow-navy-900/5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:shadow-lg hover:shadow-brand-100"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <span className="text-xs font-semibold text-navy-800">{label}</span>
    </Link>
  );
}
