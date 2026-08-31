import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, PhoneCall, ShieldCheck, Ticket } from "lucide-react";
import {
  serviceInclusions,
  subscriptionPlans,
  voucherPolicy,
} from "@/lib/data/subscription-plans";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import TiltCard from "@/components/ui/tilt-card";
import PlansHeroBackground from "@/components/subscriptions/plans-hero-background";
import JsonLd from "@/components/seo/json-ld";
import Reveal, { RevealStagger, RevealItem } from "@/components/ui/reveal";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Care Plans",
  description:
    "AGS Care Plans — monthly servicing for your air conditioning, refrigeration or electrical equipment. From £108.25/month with free call-outs and unused visits rolled into 1-month vouchers.",
  alternates: { canonical: "/subscriptions" },
  openGraph: {
    url: "/subscriptions",
    title: "Care Plans",
    description:
      "Monthly servicing plans for AC, refrigeration and electrical equipment — from £108.25/month.",
  },
};

const gbp = (n: number) =>
  n % 1 === 0 ? `£${n}` : `£${n.toFixed(2)}`;

export default function SubscriptionsPage() {
  return (
    <div className="bg-white">
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Care Plans", path: "/subscriptions" },
        ])}
      />
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Care Plans</span>
        </div>
      </div>

      {/* Hero with animated motion-graphic background */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <PlansHeroBackground />
        <div className="container-ags relative py-16 lg:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 backdrop-blur">
              <ShieldCheck className="size-3.5" />
              AGS Care Plans
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Monthly servicing, sorted.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brand-50">
              Pick a term from one month to a full year. Every plan is one
              service visit per month with the call-out charge included — and
              any visit you don&apos;t use becomes a voucher.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-brand-50">
              <span className="flex items-center gap-2">
                <PhoneCall className="size-4 text-accent-gold-400" />
                Free call-outs
              </span>
              <span className="flex items-center gap-2">
                <Ticket className="size-4 text-accent-gold-400" />
                Unused visits become vouchers
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-accent-gold-400" />
                From {gbp(108.25)}/month
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="container-ags py-12 lg:py-16">
        <RevealStagger
          step={0.07}
          className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
        >
          {subscriptionPlans.map((plan) => (
            <RevealItem key={plan.id} variant="up" className="h-full">
            <TiltCard
              max={6}
              glare
              className="h-full"
              bodyClassName={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white ags-depth-md transition-[box-shadow,border-color] duration-300 hover:ags-depth-xl ${
                plan.highlight
                  ? "border-brand-500 hover:border-brand-500"
                  : "border-slate-200 hover:border-brand-200"
              }`}
            >
              <div className="relative aspect-16/10 overflow-hidden bg-ink-950">
                <FadeInImage
                  src={plan.image}
                  alt={`${plan.name} illustration`}
                  fill
                  unoptimized
                  sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 45vw, 92vw"
                  className="object-cover"
                />
                {plan.highlight && (
                  <span
                    className="ags-tilt-layer absolute right-3 top-3 inline-flex items-center rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                    style={{ "--ags-z": "40px" } as CSSProperties}
                  >
                    Most Popular
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h2 className="font-display text-xl font-bold text-navy-900">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-3xl font-extrabold text-brand-600">
                    {gbp(plan.pricePerMonth)}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-slate-500">/ month</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {gbp(plan.price.amount)} total &middot; {plan.servicesIncluded} service
                  {plan.servicesIncluded > 1 ? "s" : ""} over {plan.months} month
                  {plan.months > 1 ? "s" : ""}
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.addOnMonthlyPrice && (
                  <p className="mt-4 rounded-lg bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                    Extend month-by-month after your term for{" "}
                    <span className="font-semibold text-navy-800">
                      {gbp(plan.addOnMonthlyPrice)}/month
                    </span>
                    .
                  </p>
                )}

                <p className="mt-4 text-xs text-slate-400">Recommended for: {plan.recommendedFor}</p>

                <ButtonLink
                  href={`/subscriptions/${plan.id}`}
                  size="lg"
                  variant={plan.highlight ? "primary" : "secondary"}
                  className="ags-tilt-layer mt-5 w-full"
                >
                  Subscribe
                  <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </TiltCard>
            </RevealItem>
          ))}
        </RevealStagger>

        {/* What every service includes */}
        <Reveal className="mt-14 grid gap-8 rounded-2xl border border-slate-200 bg-slate-25 p-8 ags-depth-sm sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              Every visit
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">
              What a service includes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The same thorough check on every scheduled visit, whichever plan
              you choose.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {serviceInclusions.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 ags-depth-sm"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-accent-green-600" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Voucher / rollover policy */}
        <Reveal
          variant="fade"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-100 bg-sky-50 p-6 ags-depth-sm"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 ags-depth-sm">
            <Ticket className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-navy-900">Unused visits are never lost</p>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{voucherPolicy}</p>
          </div>
        </Reveal>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-slate-500">
          Prices are fixed for the plan term. Our team confirms your first visit
          date and equipment details once you subscribe.
        </p>
      </div>
    </div>
  );
}
