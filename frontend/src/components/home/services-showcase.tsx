"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Refrigerator, Snowflake, Zap } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import ServiceGrid from "@/components/services/service-grid";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import TiltCard from "@/components/ui/tilt-card";
import { getServicesByCategory } from "@/lib/data/services";

export default function ServicesShowcase() {
  const reducedMotion = useReducedMotion();
  const airConditioning = getServicesByCategory("air-conditioning").slice(0, 8);
  const refrigeration = getServicesByCategory("refrigeration").slice(0, 8);
  const electrical = getServicesByCategory("electrical").slice(0, 8);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-ags">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Service marketplace
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Air conditioning, refrigeration and electrical support without online
            prices.
          </h2>
          <p className="mt-3 text-slate-600">
            Choose the service area, tell us the equipment and AGS will confirm
            the right scope before work begins.
          </p>
        </motion.div>

        <ServiceChapter
          eyebrow="Air conditioning"
          title="Comfort systems for homes, offices and commercial spaces."
          description="Installation, repairs, servicing, maintenance and diagnostics for wall-mounted, cassette, multi-split, VRV and VRF systems."
          image="/images/services/wall-mounted-ac.webp"
          imageAlt="Wall mounted air conditioning installation"
          icon={Snowflake}
          services={airConditioning}
          href="/services?category=air-conditioning"
          reverse={false}
        />

        <ServiceChapter
          eyebrow="Refrigeration"
          title="Commercial cold storage and display refrigeration kept reliable."
          description="Support for fridges, freezers, cold rooms, walk-ins, display cabinets, ice machines and industrial refrigeration plant."
          image="/images/services/cold-storage.webp"
          imageAlt="Cold room refrigeration environment"
          icon={Refrigerator}
          services={refrigeration}
          href="/services?category=refrigeration"
          reverse
        />

        <ServiceChapter
          eyebrow="Electrical"
          title="Certified electrical work, tested and signed off."
          description="Consumer units, lighting and power circuits, EV chargers, rewiring, EICR testing, fault finding and emergency callouts for homes and businesses."
          image="/images/services/electrical-installation.webp"
          imageAlt="Electrician working on a consumer unit"
          icon={Zap}
          services={electrical}
          href="/services?category=electrical"
          reverse={false}
        />
      </div>
    </section>
  );
}

function ServiceChapter({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  icon: Icon,
  services,
  href,
  reverse,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: ComponentType<{ className?: string }>;
  services: ReturnType<typeof getServicesByCategory>;
  href: string;
  reverse?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mt-16 lg:mt-20">
      <div
        className={`grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center ${
          reverse ? "lg:grid-flow-col-dense" : ""
        }`}
      >
        <motion.div
          className={reverse ? "lg:col-start-2" : ""}
          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            <Icon className="size-3.5" />
            {eyebrow}
          </span>
          <h3 className="mt-4 max-w-xl font-display text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
            {title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            {description}
          </p>
          <ButtonLink href={href} variant="secondary" size="lg" className="mt-6">
            View All {eyebrow}
            <ArrowRight className="size-4" />
          </ButtonLink>
        </motion.div>

        <motion.div
          className={`relative isolate ${reverse ? "lg:col-start-1" : ""}`}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute -inset-8 -z-10 hidden lg:block">
            <span
              className={`absolute top-4 h-28 w-44 rounded-2xl border border-brand-200/70 ags-float-slow ${
                reverse ? "right-6" : "left-6"
              }`}
            />
            <span
              className={`absolute bottom-8 h-12 w-36 rounded-xl border border-accent-gold-400/35 ags-float-delayed ${
                reverse ? "left-10" : "right-10"
              }`}
            />
            <span
              className={`absolute top-10 h-28 w-px bg-linear-to-b from-transparent via-brand-300/45 to-transparent ${
                reverse ? "right-24" : "left-24"
              }`}
            />
            <span className="absolute left-1/4 top-1/2 h-px w-2/3 -translate-y-1/2 rotate-[-12deg] bg-linear-to-r from-transparent via-brand-300/45 to-transparent" />
          </div>
          <TiltCard
            max={8}
            glare
            bodyClassName="relative aspect-16/10 overflow-hidden rounded-[2rem] ags-depth-xl"
          >
            <FadeInImage
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 55vw, 92vw"
              className="object-cover ags-image-reveal"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-950/45 via-transparent to-transparent" />
            <div
              className="ags-tilt-layer absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 ags-depth-md backdrop-blur"
              style={{ "--ags-z": "70px" } as CSSProperties}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                AGS specification
              </p>
              <p className="mt-1 text-sm font-semibold text-navy-900">
                Survey, install, maintain and repair.
              </p>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      <ServiceGrid services={services} className="mt-10" />
    </div>
  );
}
