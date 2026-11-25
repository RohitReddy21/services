"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, MapPin, Phone, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import { trackEvent } from "@/lib/analytics";
import { ORG } from "@/lib/site";

const trustItems = [
  { icon: ShieldCheck, label: "F-Gas certified engineers" },
  { icon: Timer, label: "Fast response" },
  { icon: Wrench, label: "Installation, servicing and repair" },
  { icon: BadgeCheck, label: "Work documented and guaranteed" },
];

const serviceChoices = [
  { href: "/services?category=air-conditioning", label: "Air conditioning" },
  { href: "/services?category=refrigeration", label: "Refrigeration" },
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
      <div className="container-ags py-5 lg:py-8">
        <div className="grid overflow-hidden rounded-2xl bg-ink-950 text-white lg:grid-cols-[1.05fr_1fr]">
          <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">
            <p className="text-sm font-semibold text-brand-300">
              AGS Air Conditioning &amp; Refrigeration Ltd
            </p>

            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Air conditioning and refrigeration engineers you can rely on.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              Installation, servicing, maintenance and repair for homes and
              businesses across the UK.
            </p>

            <div className="mt-8">
              <p className="text-sm font-semibold text-white">What do you need help with?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {serviceChoices.map((choice) => (
                  <Link
                    key={choice.href}
                    href={choice.href}
                    className="ags-focus group flex items-center justify-between rounded-lg border border-white/20 px-4 py-3.5 text-sm font-semibold transition-colors hover:border-white hover:bg-white hover:text-ink-950"
                  >
                    {choice.label}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            <form
              onSubmit={handlePostcodeSubmit}
              className="mt-4 flex max-w-xl flex-col gap-2.5 sm:flex-row"
            >
              <label className="relative flex-1">
                <span className="sr-only">Enter your postcode</span>
                <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  type="text"
                  placeholder="Check we cover your postcode"
                  aria-label="Check we cover your postcode"
                  className="h-12 w-full rounded-lg bg-white px-11 text-sm font-semibold text-navy-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-300"
                />
              </label>
              <Button type="submit" size="lg" className="shrink-0">
                Check availability
              </Button>
            </form>

            <p className="mt-6 flex flex-wrap items-center gap-x-2 text-sm text-slate-300">
              <Phone className="size-4 text-accent-gold-400" />
              Urgent breakdown? Call
              <a
                href={phone.href}
                className="font-bold text-white underline decoration-accent-gold-500 decoration-2 underline-offset-4"
              >
                {phone.display}
              </a>
            </p>
          </div>

          <div className="relative min-h-72 lg:min-h-full">
            <FadeInImage
              src="/images/services/hvac-repair-technician.webp"
              alt="AGS engineer checking pressures on an outdoor air conditioning unit"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[35%_center]"
            />
          </div>
        </div>

        <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
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
