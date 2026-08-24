import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlanById } from "@/lib/data/subscription-plans";
import SubscribeForm from "@/components/subscriptions/subscribe-form";

export async function generateMetadata({
  params,
}: PageProps<"/subscriptions/[planId]">): Promise<Metadata> {
  const { planId } = await params;
  const plan = getPlanById(planId);
  return { title: plan ? `Subscribe — ${plan.name}` : "Subscribe" };
}

export default async function SubscribePlanPage({
  params,
}: PageProps<"/subscriptions/[planId]">) {
  const { planId } = await params;
  const plan = getPlanById(planId);
  if (!plan) notFound();

  return (
    <div className="bg-slate-25 min-h-[calc(100vh-4.5rem)]">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/subscriptions" className="hover:text-brand-600">Care Plans</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">{plan.name}</span>
        </div>
      </div>

      <div className="container-ags py-10 lg:py-14">
        <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
          Subscribe to {plan.name}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Tell us about your equipment and where our engineers should visit.
        </p>

        <div className="mt-8">
          <SubscribeForm plan={plan} />
        </div>
      </div>
    </div>
  );
}
