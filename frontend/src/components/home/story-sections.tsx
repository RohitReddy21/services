"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
  Snowflake,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import { serviceAreas } from "@/lib/data/service-areas";

export function TechnicianSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="container-ags grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <motion.div
          className="relative order-2 lg:order-1"
          initial={reducedMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.58, ease: "easeOut" }}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/15 sm:aspect-5/4 lg:aspect-4/5">
            <FadeInImage
              src="/images/services/hvac-repair-technician.png"
              alt="Certified AGS engineer inspecting HVAC equipment"
              fill
              sizes="(min-width: 1024px) 42vw, 92vw"
              className="object-cover ags-image-reveal"
            />
            <div className="absolute inset-0 bg-linear-to-t from-navy-950/45 via-transparent to-transparent" />
          </div>

          <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl shadow-navy-900/10 backdrop-blur">
            <p className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <BadgeCheck className="size-4 text-brand-600" />
              Certified Engineer
            </p>
            <p className="mt-1 text-xs text-slate-500">F-Gas and service trained</p>
          </div>

          <div className="absolute -bottom-5 right-4 max-w-56 rounded-2xl border border-brand-100 bg-white p-4 shadow-2xl shadow-navy-900/15">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
              Site ready
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-navy-900">
              Prepared with job details, equipment history and photos.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="order-1 lg:order-2"
          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.58, ease: "easeOut" }}
        >
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Engineer-led service
          </span>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Tidy engineering work, clear communication, and practical aftercare.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            AGS engineers arrive prepared to diagnose the issue, protect the
            working area, explain the fix, and leave every system easier to
            maintain after the visit.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Compliant work", text: "Service records and commissioning notes where required." },
              { icon: Wrench, title: "Right-first-time focus", text: "Fault finding built around real system behavior." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-25 p-5">
                <Icon className="size-5 text-brand-600" />
                <h3 className="mt-3 text-sm font-bold text-navy-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function RefrigerationStory() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="overflow-hidden bg-sky-50 py-16 lg:py-24">
      <div className="container-ags">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.58, ease: "easeOut" }}
          >
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 shadow-sm shadow-brand-100">
              Refrigeration environments
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Cold rooms, displays and kitchens kept consistently in range.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              From walk-in storage to glass-front retail display, the
              refrigeration experience is designed around uptime, food safety
              and practical access for maintenance.
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={reducedMotion ? false : { opacity: 0, x: 26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.62, ease: "easeOut" }}
        >
          <div className="relative aspect-16/10 overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/15">
              <FadeInImage
                src="/images/services/commercial-refrigeration.png"
                alt="Commercial refrigeration equipment in a professional kitchen"
                fill
                sizes="(min-width: 1024px) 58vw, 92vw"
                className="object-cover ags-image-reveal"
              />
              <div className="absolute inset-0 bg-linear-to-r from-navy-950/55 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 left-5 right-5 grid gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-navy-900/10 backdrop-blur sm:grid-cols-3">
              {["Cold room", "Display fridge", "Walk-in freezer"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                  <Snowflake className="size-4 text-brand-600" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function ServiceAreaStory() {
  const reducedMotion = useReducedMotion();
  const featured = serviceAreas.slice(0, 10);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container-ags grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.58, ease: "easeOut" }}
        >
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            UK coverage
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Engineers positioned for major UK service areas.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            We support residential and commercial customers across key cities,
            with postcode checks available before you book.
          </p>
          <ButtonLink href="/service-areas" variant="secondary" size="lg" className="mt-7">
            Check Service Areas
            <ArrowRight className="size-4" />
          </ButtonLink>
        </motion.div>

        <motion.div
          className="relative min-h-96 overflow-hidden rounded-[2rem] border border-brand-100 bg-linear-to-br from-sky-50 via-white to-brand-50 p-6 shadow-xl shadow-brand-900/10"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.62, ease: "easeOut" }}
        >
          <div className="ags-uk-map absolute left-1/2 top-1/2 h-[82%] w-[54%] -translate-x-1/2 -translate-y-1/2 bg-brand-100 shadow-inner shadow-brand-300/30" />
          <div className="absolute inset-6 rounded-[1.5rem] border border-white/80" />
          {featured.map((area, index) => {
            const positions = [
              ["52%", "75%"],
              ["50%", "38%"],
              ["48%", "58%"],
              ["53%", "47%"],
              ["44%", "49%"],
              ["41%", "70%"],
              ["55%", "44%"],
              ["52%", "56%"],
              ["49%", "17%"],
              ["52%", "22%"],
            ];
            const [left, top] = positions[index] ?? ["50%", "50%"];
            return (
              <motion.div
                key={area.city}
                className="absolute"
                style={{ left, top }}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-45" />
                  <span className="relative inline-flex size-3 rounded-full border-2 border-white bg-brand-600 shadow-md" />
                </span>
                <span className="absolute left-4 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-[10px] font-bold text-navy-800 shadow-sm sm:block">
                  {area.city}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export function BookingCtaSection() {
  return (
    <section className="bg-linear-to-b from-white to-sky-50 py-16 lg:py-24">
      <div className="container-ags">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy-950 p-8 text-white shadow-2xl shadow-navy-900/20 sm:p-10 lg:p-12">
          <div className="absolute inset-0 opacity-28">
            <FadeInImage
              src="/images/services/ac-installation.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/90 to-navy-950/35" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-100">
                <CalendarCheck className="size-3.5 text-accent-gold-400" />
                Booking request
              </span>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Book an AGS engineer with the details they need before arrival.
              </h2>
              <div className="mt-5 grid gap-3 text-sm text-brand-50 sm:grid-cols-3">
                {["Choose service", "Pick date and time", "Review request"].map((step) => (
                  <span key={step} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-accent-gold-400" />
                    {step}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/book" size="lg" className="bg-white text-navy-950 hover:bg-brand-50">
                Book a Service
              </ButtonLink>
              <Link
                href="/contact"
                className="ags-focus inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Contact AGS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
