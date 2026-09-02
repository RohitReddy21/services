"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Cpu, Fan, Gauge, Snowflake, ThermometerSnowflake } from "lucide-react";
import FadeInImage from "@/components/ui/fade-in-image";
import { ThreeDLoader } from "@/components/ui/loaders";
import CanvasGuard from "@/components/three/canvas-guard";

const TechnicalShowcaseModel = dynamic(
  () => import("@/components/three/technical-showcase-model"),
  {
    ssr: false,
    loading: () => <ThreeDLoader />,
  }
);

const labels = [
  { label: "Compressor", icon: Gauge },
  { label: "Condenser", icon: ThermometerSnowflake },
  { label: "Evaporator", icon: Snowflake },
  { label: "Fan", icon: Fan },
  { label: "Control System", icon: Cpu },
];

export default function TechnicalShowcase() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const modelY = useSpring(useTransform(scrollYProgress, [0, 1], [52, -42]), {
    stiffness: 105,
    damping: 28,
  });
  const modelRotate = useSpring(useTransform(scrollYProgress, [0, 1], [4, -4]), {
    stiffness: 105,
    damping: 28,
  });

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-linear-to-b from-white via-sky-50 to-white py-16 lg:py-24"
    >
      <div className="container-ags grid gap-10 [perspective:1200px] lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.62, ease: "easeOut" }}
        >
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 shadow-sm shadow-brand-100">
            Technical assurance
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Engineered for reliable performance.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Every installation and repair is checked against the parts that
            matter most: pressure, airflow, thermal exchange, controls and
            long-term service access.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {labels.map(({ label, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-xl border border-brand-100 bg-white px-3 py-3 shadow-sm shadow-brand-100"
              >
                <Icon className="size-4 text-brand-600" />
                <p className="mt-2 text-xs font-bold text-navy-800">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative min-h-80 overflow-hidden rounded-[2rem] border border-brand-100 bg-white/80 p-4 shadow-2xl shadow-brand-900/10 [transform-style:preserve-3d] sm:min-h-96"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.62, ease: "easeOut" }}
          style={reducedMotion ? undefined : { y: modelY, rotateY: modelRotate }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-brand-50 via-white to-sky-100" />
          <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-linear-to-r from-transparent via-brand-300/60 to-transparent" />
          <div className="pointer-events-none absolute right-8 top-7 h-24 w-40 rounded-2xl border border-brand-200/60 ags-float-slow" />
          <div className="pointer-events-none absolute right-14 top-14 h-12 w-28 rounded-xl border border-accent-gold-400/35 ags-float-delayed" />
          <div className="pointer-events-none absolute right-28 top-4 h-36 w-px bg-linear-to-b from-transparent via-brand-300/45 to-transparent" />
          <div className="relative hidden h-80 sm:block lg:h-96">
            <CanvasGuard fallback={<ThreeDLoader />}>
              <TechnicalShowcaseModel />
            </CanvasGuard>
          </div>
          <div className="relative block sm:hidden">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
              <FadeInImage
                src="/images/services/outdoor-condenser-units.webp"
                alt="Outdoor condenser equipment"
                fill
                sizes="90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink-950/45 to-transparent" />
            </div>
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-navy-900/10 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
              Performance check
            </p>
            <p className="mt-1 text-sm font-semibold text-navy-900">
              Airflow, pressure and thermal stability reviewed before handover.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
