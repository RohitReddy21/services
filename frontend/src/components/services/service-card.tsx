"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Gauge } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import type { ServiceSummary } from "@/types/service";

export default function ServiceCard({ service }: { service: ServiceSummary }) {
  const href = `/services/${service.categoryId}/${service.slug}`;
  const reducedMotion = useReducedMotion();
  const tone =
    service.categoryId === "air-conditioning"
      ? { label: "Climate control", metric: "Cooling + heating" }
      : { label: "Cold chain", metric: "Temperature stable" };

  return (
    <motion.article
      data-cursor="interactive"
      whileHover={reducedMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white ags-card-depth transition-colors duration-300 hover:border-brand-200 hover:shadow-2xl hover:shadow-navy-900/15"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <FadeInImage
          src={service.image}
          alt={service.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-navy-950/50 via-navy-950/5 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
        <div className="absolute left-3 top-3 rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700 shadow-sm backdrop-blur">
          {tone.label}
        </div>
        <div className="absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-xl border border-white/55 bg-white/90 px-2.5 py-2 text-[10px] font-semibold text-navy-800 shadow-lg backdrop-blur sm:flex">
          <Gauge className="size-3 text-accent-gold-600" />
          {tone.metric}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <BadgeCheck className="size-3.5 text-accent-green-600" />
          Service ready
        </div>
        <h3 className="font-display text-sm font-bold text-navy-900 transition-transform duration-300 group-hover:translate-x-1 sm:text-base">
          {service.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
          {service.shortDescription}
        </p>
        <Link
          href={href}
          className="ags-focus mt-4 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View Details
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
        <ButtonLink
          href={`/book?category=${service.categoryId}&service=${service.slug}`}
          variant="primary"
          size="sm"
          className="mt-2 w-full"
        >
          Book Service
        </ButtonLink>
      </div>
    </motion.article>
  );
}
