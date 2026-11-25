import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ServicesExplorer from "@/components/services/services-explorer";
import JsonLd from "@/components/seo/json-ld";
import Reveal from "@/components/ui/reveal";
import PageHero from "@/components/ui/page-hero";
import { breadcrumbSchema } from "@/lib/seo";
import { services, serviceCategories } from "@/lib/data/services";
import type { ServiceCategoryId } from "@/types/service";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Browse all AGS air conditioning and refrigeration services — installation, repairs, servicing and maintenance for homes and businesses across the UK.",
  alternates: { canonical: "/services" },
  openGraph: {
    url: "/services",
    title: "Our Services",
    description:
      "Air conditioning and refrigeration services — installation, repairs, servicing and maintenance across the UK.",
  },
};

export default async function ServicesPage({
  searchParams,
}: PageProps<"/services">) {
  const params = await searchParams;
  const requested = Array.isArray(params.category) ? params.category[0] : params.category;
  const activeCategory: ServiceCategoryId =
    requested === "refrigeration"
      ? requested
      : "air-conditioning";
  const requestedQuery = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <div className="bg-white">
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <PageHero
        crumb="Services"
        eyebrow="AGS services"
        title="Our"
        highlight="services."
        description="Professional air conditioning and refrigeration services tailored to your needs. No prices are shown online; AGS confirms scope and requirements before work begins."
        image={{
          src: categoryHeroImage(activeCategory),
          alt: `${categoryMeta(activeCategory)} service equipment`,
        }}
      />

      <div className="container-ags py-10 lg:py-14">

        <Reveal delay={0.05} className="mt-8">
          <ServicesExplorer
            allServices={services}
            categories={serviceCategories}
            initialCategory={activeCategory}
            initialQuery={requestedQuery ?? ""}
          />
        </Reveal>

        <Reveal
          variant="scale"
          className="mt-14 rounded-2xl border border-brand-100 bg-sky-50 p-8 text-center shadow-sm shadow-brand-100 sm:p-10"
        >
          <h2 className="font-display text-xl font-bold text-navy-900">
            Can&apos;t find what you need?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Our experts are here to help you find the right solution for your
            home or business.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="ags-focus inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Contact Us Now
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function categoryMeta(categoryId: ServiceCategoryId) {
  if (categoryId === "refrigeration") return "Refrigeration";
  return "Air conditioning";
}

function categoryHeroImage(categoryId: ServiceCategoryId) {
  if (categoryId === "refrigeration") return "/images/services/commercial-refrigeration.webp";
  return "/images/services/outdoor-condenser-units.webp";
}
