import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { serverFetchJson } from "@/lib/server/backend-fetch";
import { ButtonLink } from "@/components/ui/button";
import SubscriptionCard from "@/components/account/subscription-card";
import type { Subscription } from "@/types/subscription";

export const metadata: Metadata = {
  title: "My Care Plans",
};

export default async function AccountSubscriptionsPage() {
  const res = await serverFetchJson<{ subscriptions: Subscription[] }>("/api/subscriptions");
  const subscriptions = res?.subscriptions ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
          My Care Plans
        </h1>
        <ButtonLink href="/subscriptions" size="md" className="hidden sm:inline-flex">
          Browse Plans
        </ButtonLink>
      </div>
      <p className="mt-1.5 text-sm text-slate-500">
        Manage your recurring maintenance subscriptions.
      </p>

      <div className="mt-6 space-y-3">
        {subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <ShieldCheck className="mx-auto size-6 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">
              You don&apos;t have any care plans yet.
            </p>
            <ButtonLink href="/subscriptions" size="md" className="mt-4">
              Browse Care Plans
            </ButtonLink>
          </div>
        ) : (
          subscriptions.map((sub) => <SubscriptionCard key={sub.id} subscription={sub} />)
        )}
      </div>
    </div>
  );
}
