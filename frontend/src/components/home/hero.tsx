"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Star, Timer } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import TiltCard from "@/components/ui/tilt-card";
import CanvasGuard from "@/components/three/canvas-guard";
import { trackEvent } from "@/lib/analytics";

const HeroSceneFallback = () => (
  <div className="relative size-full opacity-50" aria-hidden="true">
    <div className="absolute left-1/2 top-1/2 h-56 w-72 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-brand-300/25" />
    <div className="absolute left-1/2 top-1/2 h-px w-80 -translate-x-1/2 bg-brand-300/25" />
    <div className="absolute left-1/2 top-1/2 h-64 w-px -translate-y-1/2 bg-brand-300/20" />
  </div>
);

const HeroMotionScene = dynamic(() => import("@/components/three/hero-motion-scene"), {
  ssr: false,
  loading: () => <HeroSceneFallback />,
});

const trustBadges = [
  { icon: ShieldCheck, label: "Certified Engineers" },
  { icon: Timer, label: "Fast Response" },
  { icon: BadgeCheck, label: "Quality Guaranteed" },
];

export default function Hero() {
  const [postcode, setPostcode] = useState("");
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -62]), {
    stiffness: 110,
    damping: 28,
  });
  const sceneY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 130]), {
    stiffness: 95,
    damping: 26,
  });
  const sceneRotate = useSpring(useTransform(scrollYProgress, [0, 1], [0, -8]), {
    stiffness: 100,
    damping: 28,
  });
  const cardY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 46]), {
    stiffness: 95,
    damping: 26,
  });

  const handlePostcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = postcode.trim();
    if (!trimmed) return;
    trackEvent("postcode_check", { location: "hero" });
    router.push(`/service-areas?postcode=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[640px] overflow-hidden bg-ink-950 text-white sm:min-h-[700px]"
    >
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
        <motion.div
          className="pointer-events-none absolute right-[-48vw] top-16 z-[1] h-[54vh] w-[118vw] opacity-35 sm:right-[-36vw] sm:w-[98vw] sm:opacity-45 lg:inset-y-0 lg:right-[-16vw] lg:h-auto lg:w-[72vw] lg:opacity-80 xl:opacity-95"
          style={reducedMotion ? undefined : { y: sceneY, rotateZ: sceneRotate }}
          aria-hidden="true"
        >
          <CanvasGuard fallback={<HeroSceneFallback />}>
            <HeroMotionScene />
          </CanvasGuard>
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] hidden w-1/2 bg-linear-to-l from-brand-500/10 via-transparent to-transparent lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-white to-transparent" />
      </div>

      <div className="container-ags relative z-10 grid min-h-[640px] gap-12 py-16 sm:min-h-[700px] lg:grid-cols-[1fr_440px] lg:items-center lg:py-20">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={reducedMotion ? undefined : { y: contentY }}
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
          style={reducedMotion ? undefined : { y: cardY }}
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
