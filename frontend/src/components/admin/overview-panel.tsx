"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  LifeBuoy,
  RefreshCw,
  Repeat,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { fetchAdminStats } from "@/lib/api/admin-client";
import { statusMeta } from "@/lib/data/booking-status";
import type { AdminStats } from "@/types/coupon";
import type { BookingStatus } from "@/types/service";
import { PanelHeader, StatCard } from "@/components/admin/panel-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineLoader } from "@/components/ui/loaders";

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export default function OverviewPanel({ onJump }: { onJump: (tab: string) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => fetchAdminStats().then(setStats), []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  if (!stats) return <InlineLoader />;

  const statusEntries = Object.entries(stats.bookings.byStatus).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(1, ...statusEntries.map(([, n]) => n));

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Overview"
        subtitle="Live snapshot across the platform"
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button type="button" onClick={() => onJump("bookings")} className="text-left">
          <StatCard
            label="Bookings"
            value={stats.bookings.total}
            hint={`${stats.bookings.byStatus["BOOKING_RECEIVED"] ?? 0} awaiting action`}
            icon={CalendarClock}
            tone="brand"
          />
        </button>
        <button type="button" onClick={() => onJump("subscriptions")} className="text-left">
          <StatCard
            label="Care Plan revenue"
            value={gbp(stats.subscriptions.monthlyRevenue)}
            hint={`${stats.subscriptions.active} active · ${stats.subscriptions.paused} paused`}
            icon={TrendingUp}
            tone="green"
          />
        </button>
        <button type="button" onClick={() => onJump("subscriptions")} className="text-left">
          <StatCard
            label="Active Care Plans"
            value={stats.subscriptions.active}
            hint={`${stats.subscriptions.cancelled} cancelled all-time`}
            icon={Repeat}
            tone="brand"
          />
        </button>
        <button type="button" onClick={() => onJump("support")} className="text-left">
          <StatCard
            label="Open tickets"
            value={stats.tickets.open}
            hint={`${stats.tickets.total} total`}
            icon={LifeBuoy}
            tone="amber"
          />
        </button>
        <button type="button" onClick={() => onJump("users")} className="text-left">
          <StatCard
            label="Users"
            value={stats.users.total}
            hint={`${stats.users.admins} admin${stats.users.admins === 1 ? "" : "s"}`}
            icon={Users}
            tone="slate"
          />
        </button>
        <button type="button" onClick={() => onJump("reviews")} className="text-left">
          <StatCard
            label="Avg rating"
            value={stats.reviews.avgRating ? `${stats.reviews.avgRating} ★` : "—"}
            hint={`${stats.reviews.count} review${stats.reviews.count === 1 ? "" : "s"}`}
            icon={Star}
            tone="gold"
          />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 ags-depth-sm">
          <h3 className="font-display text-sm font-bold text-navy-900">Bookings by status</h3>
          <div className="mt-4 space-y-2.5">
            {statusEntries.length === 0 && <EmptyState message="No bookings yet." />}
            {statusEntries.map(([status, n]) => {
              const meta = statusMeta[status as BookingStatus];
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-xs font-semibold text-slate-500">
                    {meta?.label ?? status}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(n / maxStatus) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-bold text-navy-900">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 ags-depth-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-navy-900">Recent bookings</h3>
            <button
              type="button"
              onClick={() => onJump("bookings")}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {stats.recentBookings.length === 0 && <EmptyState message="No bookings yet." />}
            {stats.recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy-900">
                    {b.customer?.fullName ?? "—"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {b.bookingReference} · {b.equipmentLabel}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {statusMeta[b.status as BookingStatus]?.label ?? b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 ags-depth-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-navy-900">Open support tickets</h3>
          <button
            type="button"
            onClick={() => onJump("support")}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Go to support
          </button>
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {stats.openTickets.length === 0 && (
            <EmptyState message="No open tickets — nice and quiet." />
          )}
          {stats.openTickets.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{t.subject}</p>
                <p className="truncate text-xs text-slate-400">
                  {t.category.replaceAll("_", " ")} · {t.email}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {new Date(t.createdAt).toLocaleDateString("en-GB")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="size-3" />
        Data refreshes when you open this tab or hit refresh.
        <Link href="/" className="ml-auto font-semibold text-brand-600 hover:text-brand-700">
          Back to site
        </Link>
      </p>
    </div>
  );
}
