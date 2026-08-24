"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, PlusCircle, User, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/book", label: "Book", icon: PlusCircle },
  { href: "/account/bookings", label: "Bookings", icon: Calendar },
  { href: "/account", label: "Account", icon: User },
];

export default function AccountMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 shadow-2xl shadow-navy-900/10 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {links.map((link) => {
          const isActive =
            link.href === "/account" ? pathname === "/account" : pathname.startsWith(link.href) && link.href !== "/";
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "ags-focus flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                isActive ? "text-brand-600" : "text-slate-500 hover:text-navy-700"
              )}
            >
              <span className={cn("rounded-full p-1", isActive && "bg-brand-50")}>
                <link.icon className="size-5" />
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
