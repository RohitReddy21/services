"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { markNotificationReadRequest } from "@/lib/api/account-client";
import type { Notification } from "@/types/account";
import { cn } from "@/lib/utils";

export default function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const [read, setRead] = useState(notification.read);

  const handleClick = async () => {
    if (!read) {
      setRead(true);
      await markNotificationReadRequest(notification.id);
      router.refresh();
    }
  };

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
        read ? "border-slate-200 bg-white" : "border-brand-200 bg-brand-50"
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          read ? "bg-transparent" : "bg-brand-500"
        )}
      />
      <div>
        <p className="text-sm font-semibold text-navy-900">{notification.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{notification.message}</p>
        <p className="mt-1.5 text-[11px] text-slate-400">
          {new Date(notification.createdAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );

  return notification.href ? (
    <Link href={notification.href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
