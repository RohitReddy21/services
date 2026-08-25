import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  Gauge,
  Home,
  ShieldCheck,
  Star,
  Store,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import FadeInImage from "@/components/ui/fade-in-image";
import {
  categoryContent,
  getServiceBySlug,
  serviceCategories,
  services,
} from "@/lib/data/services";
import type { ServiceCategoryId } from "@/types/service";

const idealForIcon = {
  home: Home,
  building: Building2,
  store: Store,
  utensils: UtensilsCrossed,
  briefcase: Briefcase,
} as const;

export function generateStaticParams() {
  return services.map((service) => ({
    category: service.categoryId,
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await params;
  const service = getServiceBySlug(category as ServiceCategoryId, slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/services/[category]/[slug]">) {
  const { category, slug } = await params;
  const categoryId = category as ServiceCategoryId;
  const service = getServiceBySlug(categoryId, slug);
  const categoryMeta = serviceCategories.find((c) => c.id === categoryId);

  if (!service || !categoryMeta) notFound();

  const content = categoryContent[categoryId];

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags flex flex-wrap items-center gap-1.5 py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href={`/services?category=${categoryId}`} className="hover:text-brand-600">
            {categoryMeta.name}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-navy-700">{service.name}</span>
        </div>
      </div>

      <section className="relative overflow-hidden bg-ink-950 text-white">
        <FadeInImage
          src={service.heroImage}
          alt={service.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/80 to-ink-950/30" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent" />

        <div className="container-ags relative grid gap-10 py-16 lg:grid-cols-[1fr_360px] lg:items-end lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-100 backdrop-blur">
              {categoryMeta.name}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              {service.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-50 sm:text-lg">
              {service.shortDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink
                href={`/book?category=${categoryId}&service=${service.slug}`}
                size="lg"
              >
                Book This Service
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                Contact AGS
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl shadow-navy-950/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white text-brand-600">
                <Gauge className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-100">
                  Service scope
                </p>
                <p className="text-sm font-semibold text-white">Survey, diagnose, repair or install.</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {content.whatWeProvide.slice(0, 4).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-brand-50">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-gold-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="container-ags grid gap-10 py-10 lg:grid-cols-[1fr_360px] lg:py-14">
        <div>
          <Section title="Overview">
            <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
          </Section>

          <Section title="What We Provide">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {content.whatWeProvide.map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Applications">
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {service.applications.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Common Issues We Fix">
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {service.commonProblems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Maintenance, Repairs & Installation">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Maintenance", text: "Planned checks to keep performance stable and reduce avoidable downtime." },
                { icon: Wrench, title: "Repairs", text: "Structured diagnostics and practical fixes for faults, leaks and component failure." },
                { icon: CalendarCheck, title: "Installation", text: "Survey-led installation with tidy routing, commissioning and handover notes." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-25 p-5">
                  <Icon className="size-5 text-brand-600" />
                  <h3 className="mt-3 text-sm font-bold text-navy-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Our Process">
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.process.map((step) => (
                <li key={step.step} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-navy-900/5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                    {step.step}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-navy-900">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.description}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Frequently Asked Questions">
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {content.faqs.map((faq) => (
                <details key={faq.question} className="group p-4">
                  <summary className="ags-focus cursor-pointer list-none rounded-md text-sm font-semibold text-navy-900 marker:content-none">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Section>

          <Section title="Reviews">
            <div className="grid gap-4 sm:grid-cols-2">
              {content.reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-slate-200 bg-slate-25 p-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-accent-gold-500 text-accent-gold-500" />
                    ))}
                  </div>
                  <p className="mt-2 text-sm italic leading-relaxed text-navy-800">&ldquo;{review.text}&rdquo;</p>
                  <p className="mt-2 text-xs font-semibold text-navy-900">
                    {review.author} <span className="font-normal text-slate-400">&middot; {review.location}</span>
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Service Areas">
            <p className="text-sm leading-relaxed text-slate-600">
              We cover London, Manchester, Birmingham, Leeds, Liverpool, Bristol
              and many more UK locations.{" "}
              <Link href="/service-areas" className="font-semibold text-brand-600 hover:text-brand-700">
                View all service areas
              </Link>
            </p>
          </Section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-navy-900/10">
            <div className="relative aspect-4/3">
              <FadeInImage
                src={service.image}
                alt={`${service.name} service`}
                fill
                sizes="360px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink-950/55 to-transparent" />
            </div>
            <div className="p-6">
              <h2 className="font-display text-base font-bold text-navy-900">Ideal For</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {content.idealFor.map((entry) => {
                  const Icon = idealForIcon[entry.icon];
                  return (
                    <div key={entry.label} className="flex flex-col items-center gap-1.5 text-center">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-600">{entry.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-brand-100 bg-sky-50 p-6 shadow-sm shadow-brand-100">
            <p className="text-xs leading-relaxed text-slate-500">
              Service details and any applicable charges will be confirmed by
              our team &mdash; no pricing shown online.
            </p>
            <ButtonLink
              href={`/book?category=${categoryId}&service=${service.slug}`}
              size="lg"
              className="w-full"
            >
              Book This Service
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg" className="w-full">
              Contact Us
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-slate-200 pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
