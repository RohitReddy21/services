"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Star, Timer } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import TiltCard from "@/components/ui/tilt-card";
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
      {/* Background: one photo, one ambient video, cinematic scrims. */}
      <div className="absolute inset-0">
        <div className="ags-ken-burns absolute inset-0">
          <FadeInImage
            src="/images/services/hvac-repair-technician.png"
            alt="AGS engineer servicing commercial HVAC equipment"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {!reducedMotion && (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/services/outdoor-condenser-units.png"
            className="absolute inset-0 size-full object-cover opacity-25 saturate-[0.7]"
            aria-hidden="true"
          >
            <source src="/videos/hero-skyline.mp4" type="video/mp4" />
          </video>
        )}

        {/* Directional scrim — dark on the left for headline contrast. */}
        <div className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/85 to-ink-950/35" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/10 to-ink-950/50" />
        <div className="ags-hero-sweep absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-white to-transparent" />
      </div>

      <div className="container-ags relative grid min-h-[640px] gap-12 py-16 sm:min-h-[700px] lg:grid-cols-[1fr_440px] lg:items-center lg:py-20">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100 backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent-gold-400" />
            AGS · Advanced Gas Solutions
          </span>

          <h1 className="mt-6 font-display text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4rem]">
            Advanced Air Conditioning &amp; Refrigeration Solutions
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-50/90 sm:text-lg">
            Professional installation, servicing, maintenance and repair for
            commercial and residential customers across the UK.
          </p>

          <form
            onSubmit={handlePostcodeSubmit}
            className="mt-9 flex max-w-lg flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/6 p-2 backdrop-blur sm:flex-row"
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

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          <TiltCard
            max={4}
            bodyClassName="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-3 ags-depth-xl backdrop-blur-sm"
          >
            <div className="relative aspect-4/5 overflow-hidden rounded-xl">
              <FadeInImage
                src="/images/services/ac-installation.png"
                alt="AGS engineers installing an air conditioning system"
                fill
                priority
                sizes="440px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/10 to-transparent" />

              <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink-950/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-100 backdrop-blur">
                Serving the UK since 2014
              </span>

              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl border border-white/12 bg-ink-950/55 px-4 py-3 backdrop-blur">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-200">
                    F&#8209;Gas certified
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Compliant &amp; documented
                  </p>
                </div>
                <div className="flex items-center gap-1.5 border-l border-white/15 pl-4">
                  <Star className="size-4 fill-accent-gold-400 text-accent-gold-400" />
                  <span className="font-display text-lg font-extrabold text-white">4.9</span>
                  <span className="text-[10px] text-brand-100">/ 5</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
