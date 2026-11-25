import Link from "next/link";
import { ArrowRight, ArrowUpRight, Phone, Refrigerator, Snowflake } from "lucide-react";
import type { ComponentType } from "react";
import { ButtonLink } from "@/components/ui/button";
import LoopVideo from "@/components/ui/loop-video";
import Reveal, { RevealItem, RevealStagger } from "@/components/ui/reveal";
import { getServicesByCategory } from "@/lib/data/services";
import { ORG } from "@/lib/site";
import type { ServiceCategoryId } from "@/types/service";

interface CategoryPanel {
  id: ServiceCategoryId;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  video: string;
  imageAlt: string;
  icon: ComponentType<{ className?: string }>;
}

const panels: CategoryPanel[] = [
  {
    id: "air-conditioning",
    eyebrow: "Air conditioning",
    title: "Comfort systems for homes, offices and commercial spaces.",
    description:
      "Installation, repairs, servicing and diagnostics for wall-mounted, cassette, multi-split, VRV and VRF systems.",
    image: "/images/services/wall-mounted-ac.webp",
    video: "/videos/ags-ac-install",
    imageAlt: "Wall mounted air conditioning installation",
    icon: Snowflake,
  },
  {
    id: "refrigeration",
    eyebrow: "Refrigeration",
    title: "Commercial cold storage and display kept reliable.",
    description:
      "Fridges, freezers, cold rooms, walk-ins, display cabinets and ice machines.",
    image: "/images/services/cold-storage.webp",
    video: "/videos/ags-fridge-open",
    imageAlt: "Cold room refrigeration environment",
    icon: Refrigerator,
  },
];

export default function ServicesShowcase() {
  return (
    <section className="relative bg-white py-20 lg:py-28">
      <div className="container-ags">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="ags-eyebrow">What we do</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-5xl">
              Air conditioning and refrigeration,
              <span className="block text-brand-600">installed and looked after properly.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
              Choose your service area, tell us about the equipment, and AGS
              confirms the right scope with you before any work begins.
            </p>
          </div>
          <ButtonLink href="/services" variant="secondary" size="lg" className="self-start lg:self-auto">
            Browse all services
            <ArrowRight className="size-4" />
          </ButtonLink>
        </Reveal>

        <RevealStagger className="mt-12 grid gap-6 lg:grid-cols-2" step={0.12}>
          {panels.map((panel) => (
            <RevealItem key={panel.id} distance={32}>
              <CategoryCard panel={panel} />
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal delay={0.05} className="mt-6">
          <div className="relative overflow-hidden rounded-2xl bg-ink-950 px-6 py-6 text-white sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="relative flex items-start gap-4">
              <span className="relative mt-1 flex size-3 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-gold-400 opacity-60" />
                <span className="relative inline-flex size-3 rounded-full bg-accent-gold-500" />
              </span>
              <div>
                <p className="font-display text-xl font-bold">System down? Don&apos;t wait.</p>
                <p className="mt-1 text-sm text-slate-300">
                  Urgent breakdowns are prioritised. Call us and an engineer will take it from there.
                </p>
              </div>
            </div>
            <a
              href={ORG.phones[0].href}
              className="ags-focus relative mt-5 inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-6 text-base font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-brand-50 lg:mt-0 lg:shrink-0"
            >
              <Phone className="size-4 text-brand-600" />
              {ORG.phones[0].display}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CategoryCard({ panel }: { panel: CategoryPanel }) {
  const all = getServicesByCategory(panel.id);
  const featured = all.slice(0, 5);
  const Icon = panel.icon;

  return (
    <article className="group relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden rounded-2xl bg-ink-950 text-white shadow-2xl shadow-navy-900/15 ags-lift">
      <LoopVideo src={panel.video} className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-ink-950/60" />

      <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/20 bg-ink-950/50 py-1.5 pl-2 pr-3.5 text-xs font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-500">
          <Icon className="size-3.5" />
        </span>
        {panel.eyebrow}
        <span className="text-slate-300">· {all.length} services</span>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="max-w-md font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          {panel.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">{panel.description}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {featured.map((service) => (
            <li key={service.id}>
              <Link
                href={`/services/${service.categoryId}/${service.slug}`}
                className="ags-focus inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-white/50 hover:bg-white/20"
              >
                {service.name}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={`/services?category=${panel.id}`}
          className="ags-focus mt-7 inline-flex items-center gap-2 text-sm font-bold text-white"
        >
          <span className="border-b-2 border-brand-400 pb-0.5 transition-colors group-hover:border-white">
            Explore {panel.eyebrow.toLowerCase()}
          </span>
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
