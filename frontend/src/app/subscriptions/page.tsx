import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { subscriptionPlans } from "@/lib/data/subscription-plans";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Care Plans",
  description:
    "Subscribe to a recurring AGS maintenance plan for your air conditioning or refrigeration equipment — regular visits, priority scheduling, no surprises.",
};

export default function SubscriptionsPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Care Plans</span>
        </div>
      </div>

      <div className="container-ags py-10 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <ShieldCheck className="size-3.5" />
            AGS Care Plans
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Never miss a service again
          </h1>
          <p className="mt-3 text-slate-600">
            Subscribe to a recurring maintenance plan and we&apos;ll keep your
            air conditioning or refrigeration equipment running reliably —
            with regular visits scheduled automatically.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {subscriptionPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
                index === 1
                  ? "border-brand-500 bg-brand-50/40 shadow-lg shadow-brand-600/10"
                  : "border-slate-200 bg-white"
              }`}
            >
              {index === 1 && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h2 className="font-display text-xl font-bold text-navy-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

              {plan.price ? (
                <p className="mt-4 font-display text-2xl font-extrabold text-brand-600">
                  &euro;{plan.price.amount}
                  <span className="ml-1.5 text-sm font-semibold text-slate-500">
                    / {plan.price.billingCycleMonths} months
                  </span>
                </p>
              ) : (
                <p className="mt-4 font-display text-2xl font-extrabold text-brand-600">
                  {plan.visitsPerYear}
                  <span className="ml-1.5 text-sm font-semibold text-slate-500">
                    visit{plan.visitsPerYear > 1 ? "s" : ""} / year
                  </span>
                </p>
              )}

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.rolloverPolicy && (
                <p className="mt-4 rounded-lg bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                  {plan.rolloverPolicy}
                </p>
              )}

              <p className="mt-5 text-xs text-slate-400">
                Recommended for: {plan.recommendedFor}
              </p>

              <ButtonLink href={`/subscriptions/${plan.id}`} size="lg" className="mt-5 w-full">
                Subscribe
              </ButtonLink>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl rounded-xl bg-sky-50 px-5 py-4 text-center text-sm text-slate-600">
          Pricing is only shown for fixed-package plans like Premium Care.
          For all other plans, our team will confirm your plan details and
          any applicable charges once you subscribe.
        </p>
      </div>
    </div>
  );
}
