import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/server/current-user";
import { serverFetchJson } from "@/lib/server/backend-fetch";
import NotificationItem from "@/components/account/notification-item";
import type { Notification } from "@/types/account";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const res = await serverFetchJson<{ notifications: Notification[] }>(
    "/api/account/notifications"
  );
  const notifications = res?.notifications ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
        Notifications
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">Updates about your bookings and account.</p>

      <div className="mt-6 space-y-2.5">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Bell className="mx-auto size-6 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
        )}
      </div>
    </div>
  );
}
