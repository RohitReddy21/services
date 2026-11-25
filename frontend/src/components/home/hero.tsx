"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Timer } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import { trackEvent } from "@/lib/analytics";

const trustBadges = [
  { icon: ShieldCheck, label: "Certified Engineers" },
  { icon: Timer, label: "Fast Response" },
  { icon: BadgeCheck, label: "Quality Guaranteed" },
];

export default function Hero() {
  const [postcode, setPostcode] = useState("");
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const handlePostcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = postcode.trim();
    if (!trimmed) return;
    trackEvent("postcode_check", { location: "hero" });
    router.push(`/service-areas?postcode=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative min-h-[640px] overflow-hidden bg-ink-950 text-white sm:min-h-[700px]">
      {/* Photo: behind the text on phones, a clean full-height panel on desktop. */}
      <div className="absolute inset-0 lg:left-auto lg:w-[46%]">
        <FadeInImage
          src="/images/services/hvac-repair-technician.webp"
          alt="AGS engineer checking pressures on an outdoor air conditioning unit"
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover object-[30%_center]"
        />
        <div className="absolute inset-0 bg-ink-950/75 lg:hidden" />
        <div className="absolute bottom-8 left-8 hidden rounded-lg bg-ink-950 px-4 py-3 lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-300">
            F&#8209;Gas certified
          </p>
          <p className="mt-0.5 text-sm font-semibold text-white">Compliant &amp; documented</p>
        </div>
      </div>

      <div className="container-ags relative z-10 flex min-h-[640px] items-center py-16 sm:min-h-[700px] lg:py-20">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl lg:max-w-[48%]"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100">
            <span className="size-1.5 rounded-full bg-accent-gold-400" />
            AGS Air Conditioning & Refrigeration Ltd
          </span>

          <h1 className="mt-6 font-display text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
            Advanced Air Conditioning &amp;{" "}
            <span className="ags-gradient-text">Refrigeration Solutions</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-50/90 sm:text-lg">
            Professional installation, servicing, maintenance and repair for
            commercial and residential customers across the UK.
          </p>

          <form
            onSubmit={handlePostcodeSubmit}
            className="mt-9 flex max-w-lg flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/6 p-2 sm:flex-row"
          >
            <label className="relative flex-1">
              <span className="sr-only">Enter your postcode</span>
              <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-200" />
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                type="text"
                placeholder="Enter your postcode"
                aria-label="Enter your postcode"
                className="h-12 w-full rounded-xl border border-white/10 bg-white px-11 text-sm font-semibold text-navy-900 placeholder:text-slate-400 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
              />
            </label>
            <Button type="submit" size="lg" className="shrink-0">
              Check Availability
            </Button>
          </form>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/book" size="lg">
              Book a Service
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg">
              Explore Services
            </ButtonLink>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-brand-50/80"
              >
                <Icon className="size-4 text-accent-gold-400" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
