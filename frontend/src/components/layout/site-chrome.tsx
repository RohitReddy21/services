"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Staff tools get their own header and no marketing furniture — an engineer on
 * site shouldn't have to scroll past the full site footer to reach their next
 * job, and the public nav is meaningless in the admin console.
 */
const STAFF_ROUTES = ["/technician", "/admin"];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = STAFF_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isStaffRoute) return null;
  return <>{children}</>;
}
