import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";

export const metadata: Metadata = {
  title: "Engineer",
  robots: { index: false, follow: false },
};

export default async function TechnicianLayout({ children }: LayoutProps<"/technician">) {
  const user = await getCurrentUser();

  if (!user) {
    // middleware.ts already bounces anyone without a session cookie, so getting
    // here with one means the API was slow (cold start) — render rather than
    // kicking a signed-in engineer back to the login page.
    const hasSession = (await cookies()).has("ags_at");
    if (!hasSession) redirect("/login?redirect=/technician");
  } else if (user.role !== "TECHNICIAN" && user.role !== "ADMIN") {
    // Customers have no business here; send them somewhere useful.
    redirect("/account");
  }

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
