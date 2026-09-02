import type { Metadata } from "next";
import Link from "next/link";
import { Award, HardHat, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import Reveal, { RevealStagger, RevealItem } from "@/components/ui/reveal";
import Parallax from "@/components/ui/parallax";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "AGS - Advanced Gas Solutions is a UK air conditioning and refrigeration specialist, delivering certified installation, servicing and repair for homes and businesses.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About Us" },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Quality",
    description:
      "Every installation and repair is carried out to manufacturer specification and industry standards, with genuine parts and proper testing.",
  },
  {
    icon: HardHat,
    title: "Safety",
    description:
      "Our engineers are F-Gas certified and follow strict safety procedures on every visit, from risk assessment through to sign-off.",
  },
  {
    icon: Users,
    title: "Customer Commitment",
    description:
      "We communicate clearly, turn up when we say we will, and stand behind our work — no surprises, no jargon.",
  },
  {
    icon: Award,
    title: "Our Approach",
    description:
      "We treat every job — from a single wall unit to a multi-site refrigeration contract — with the same level of care and attention to detail.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">About Us</span>
        </div>
      </div>

      <section className="container-ags grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
        <Reveal variant="up">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            About AGS
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Advanced Gas Solutions
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            AGS is a UK-based air conditioning and refrigeration specialist,
            trusted by homes and businesses across the country. From a single
            wall-mounted unit to multi-site commercial refrigeration
            contracts, our certified engineers deliver installation,
            servicing, maintenance and repair with the same standard of
            care every time.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            We built AGS around a simple idea: HVAC and refrigeration work
            should be handled by properly qualified people, communicated
            clearly, and completed without disruption to your home or
            business.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <Stat value="10+" label="Years Experience" />
            <Stat value="500+" label="Projects Completed" />
            <Stat value="1000+" label="Happy Customers" />
          </div>
        </Reveal>

        <Reveal
          variant="right"
          delay={0.1}
          className="relative aspect-4/5 overflow-hidden rounded-3xl shadow-xl shadow-navy-900/10 sm:aspect-5/4"
        >
          <Parallax amount={28} className="absolute inset-0">
            <FadeInImage
              src="/images/services/hvac-repair-technician.webp"
              alt="AGS engineer working on HVAC equipment"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="scale-110 object-cover"
            />
          </Parallax>
        </Reveal>
      </section>

      <section className="bg-sky-50 py-14 lg:py-20">
        <div className="container-ags">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
              What We Stand For
            </h2>
          </Reveal>

          <RevealStagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <RevealItem
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <value.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-navy-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.description}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="container-ags py-14 lg:py-20">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
            Our Engineers
          </h2>
          <p className="mt-3 text-slate-600">
            Every AGS engineer is F-Gas certified and trained across
            residential and commercial systems, so you get consistent,
            qualified work whether it&apos;s a single home visit or an
            ongoing commercial contract.
          </p>
        </Reveal>

        <Reveal
          variant="scale"
          delay={0.05}
          className="mx-auto mt-8 max-w-lg rounded-2xl border border-slate-200 bg-slate-25 p-6 text-center"
        >
          <p className="text-sm text-slate-600">
            Ready to work with us?
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/book" size="lg">Book a Service</ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">Contact Us</ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-xl font-extrabold text-brand-600 sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}
