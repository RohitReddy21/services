import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import AdminDashboard from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Deliberately renders a plain 404 for anyone who isn't an authenticated
  // admin — this route is not linked anywhere and should look like it
  // doesn't exist rather than reveal an "access denied" page.
  if (!user || user.role !== "ADMIN") {
    notFound();
  }

  return <AdminDashboard adminName={user.name} />;
}
