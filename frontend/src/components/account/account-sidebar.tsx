"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Settings,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/bookings", label: "My Bookings", icon: Calendar },
  { href: "/account/subscriptions", label: "Care Plans", icon: ShieldCheck },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/support", label: "Support", icon: LifeBuoy },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-brand-100 bg-white/90 p-2 shadow-xl shadow-navy-900/10 backdrop-blur">
        {links.map((link) => {
          const isActive =
            link.href === "/account" ? pathname === "/account" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "ags-focus relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm shadow-brand-100"
                  : "text-navy-700 hover:bg-slate-100 hover:text-brand-700"
              )}
            >
              <link.icon className="size-4" />
              {link.label}
              {isActive && (
                <span className="absolute right-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
