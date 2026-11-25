"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, MapPin, Phone, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import { trackEvent } from "@/lib/analytics";
import { ORG } from "@/lib/site";

const trustItems = [
  { icon: ShieldCheck, label: "F-Gas certified engineers" },
  { icon: Timer, label: "Fast response" },
  { icon: Wrench, label: "Installation, servicing and repair" },
  { icon: BadgeCheck, label: "Work documented and guaranteed" },
];

export default function Hero() {
  const [postcode, setPostcode] = useState("");
  const router = useRouter();
  const phone = ORG.phones[0];

  const handlePostcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = postcode.trim();
    if (!trimmed) return;
    trackEvent("postcode_check", { location: "hero" });
    router.push(`/service-areas?postcode=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="bg-white">
      <div className="container-ags py-4 lg:py-8">
        <div className="overflow-hidden rounded-2xl bg-ink-950 text-white lg:grid lg:grid-cols-2">
          <div className="relative h-60 sm:h-80 lg:order-2 lg:h-auto lg:min-h-[500px]">
            <FadeInImage
              src="/images/services/ac-installation.webp"
              alt="AGS engineer fitting a wall mounted air conditioning unit"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[38%_center]"
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:order-1 lg:px-14 lg:py-16">
            <p className="text-sm font-semibold text-brand-300">
              AGS Air Conditioning &amp; Refrigeration Ltd
            </p>

            <h1 className="mt-3 font-display text-[2.1rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Air conditioning and refrigeration, done right.
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
              Installation, servicing and repair for homes and businesses across the UK.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/book" size="lg">
                Book a service
                <ArrowRight className="size-4" />
              </ButtonLink>
              <a
                href={phone.href}
                className="ags-focus inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-base font-semibold transition-colors hover:border-white hover:bg-white hover:text-ink-950"
              >
                <Phone className="size-4" />
                {phone.display}
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={handlePostcodeSubmit}
          className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <p className="text-sm font-semibold text-navy-900">Check we cover your area</p>
          <div className="flex flex-1 flex-col gap-2.5 sm:max-w-xl sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Enter your postcode</span>
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                type="text"
                placeholder="Postcode"
                aria-label="Enter your postcode"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-10 text-sm font-semibold text-navy-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <Button type="submit" size="md" className="shrink-0">
              Check availability
            </Button>
          </div>
        </form>

        <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-navy-800">
              <Icon className="size-5 shrink-0 text-brand-500" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
