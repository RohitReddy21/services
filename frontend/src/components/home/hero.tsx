"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Timer } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import Hero3DAccent from "@/components/three/hero-3d-accent";

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
    if (!postcode.trim()) return;
    router.push(`/service-areas?postcode=${encodeURIComponent(postcode.trim())}`);
  };

  return (
    <section className="relative min-h-[760px] overflow-hidden bg-navy-950 text-white sm:min-h-[720px]">
      <div className="absolute inset-0">
        <FadeInImage
          src="/images/services/hvac-repair-technician.png"
          alt="AGS engineer servicing commercial HVAC equipment"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          initial={false}
          animate={reducedMotion ? undefined : { scale: [1, 1.045, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        >
          <FadeInImage
            src="/images/services/outdoor-condenser-units.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30 mix-blend-screen"
          />
        </motion.div>
        <div className="absolute inset-0 ags-cinematic-bg" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-white to-transparent" />
      </div>

      <div className="container-ags relative grid min-h-[760px] gap-10 py-16 sm:min-h-[720px] lg:grid-cols-[1fr_430px] lg:items-center lg:py-20">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 backdrop-blur">
            AGS Advanced Gas Solutions
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Advanced Air Conditioning &amp; Refrigeration Solutions
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-50 sm:text-lg">
            Professional installation, servicing, maintenance and repair
            solutions for commercial and residential customers across the UK.
          </p>

          <form
            onSubmit={handlePostcodeSubmit}
            className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur sm:flex-row"
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
                className="h-12 w-full rounded-xl border border-white/15 bg-white px-11 text-sm font-semibold text-navy-900 placeholder:text-slate-400 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
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

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-semibold text-brand-50">
                <Icon className="size-4 text-accent-gold-400" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: 24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/25 bg-white/15 p-4 shadow-2xl shadow-navy-950/40 backdrop-blur-xl">
            <div className="relative aspect-4/5 overflow-hidden rounded-[1.5rem]">
              <FadeInImage
                src="/images/services/ac-installation.png"
                alt="Air conditioning installation equipment"
                fill
                priority
                sizes="430px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-navy-950/70 via-navy-950/10 to-transparent" />
            </div>
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/30 bg-white/90 p-4 text-navy-900 shadow-xl backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                System ready
              </p>
              <p className="mt-1 text-sm font-semibold">
                Installation, servicing, maintenance and repair.
              </p>
            </div>
          </div>
          <Hero3DAccent className="absolute -right-8 top-10 flex size-36 items-center justify-center rounded-3xl border border-white/45 bg-white/90 shadow-2xl shadow-navy-950/25 backdrop-blur" />
        </motion.div>
      </div>
    </section>
  );
}
