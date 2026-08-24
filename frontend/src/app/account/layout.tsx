import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import AccountSidebar from "@/components/account/account-sidebar";
import AccountMobileNav from "@/components/account/account-mobile-nav";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-linear-to-b from-sky-50 via-white to-slate-25 pb-20 lg:pb-0">
      <div className="container-ags flex gap-8 py-8 lg:py-12">
        <AccountSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <AccountMobileNav />
    </div>
  );
}
