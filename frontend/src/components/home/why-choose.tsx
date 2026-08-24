"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Award, HeartHandshake, ShieldCheck, Wrench } from "lucide-react";
import FadeInImage from "@/components/ui/fade-in-image";

const features = [
  {
    icon: ShieldCheck,
    title: "Expert Engineers",
    description: "Certified HVAC and refrigeration specialists with practical site experience.",
  },
  {
    icon: Wrench,
    title: "Reliable Service",
    description: "Prepared visits, clear arrival windows and reduced disruption on site.",
  },
  {
    icon: Award,
    title: "Quality Workmanship",
    description: "Neat installation, careful commissioning and durable repair standards.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Focused",
    description: "Straightforward communication before, during and after every booking.",
  },
];

export default function WhyChoose() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="overflow-hidden bg-linear-to-b from-sky-50 to-white py-16 lg:py-24">
      <div className="container-ags">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.58, ease: "easeOut" }}
          >
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 shadow-sm shadow-brand-100">
              Why AGS
            </span>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
              Premium service is mostly invisible when it is done properly.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              We focus on the details customers feel later: stable temperatures,
              cleaner installations, fewer repeat visits and systems that are
              easier to maintain.
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.62, ease: "easeOut" }}
          >
            <div className="relative aspect-16/10 overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/15">
              <FadeInImage
                src="/images/services/outdoor-condenser-units.png"
                alt="Outdoor condenser units installed for commercial climate control"
                fill
                sizes="(min-width: 1024px) 54vw, 92vw"
                className="object-cover ags-image-reveal"
              />
              <div className="absolute inset-0 bg-linear-to-t from-navy-950/55 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-navy-900/10 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                Quality check
              </p>
              <p className="mt-1 text-sm font-semibold text-navy-900">
                Performance verified before handover.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-navy-900/5 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-navy-900/10"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-navy-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
