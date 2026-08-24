import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Refrigerator, Snowflake } from "lucide-react";
import ServiceGrid from "@/components/services/service-grid";
import FadeInImage from "@/components/ui/fade-in-image";
import { getServicesByCategory, serviceCategories } from "@/lib/data/services";
import type { ServiceCategoryId } from "@/types/service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Browse all AGS air conditioning and refrigeration services — installation, repairs, servicing and maintenance for homes and businesses across the UK.",
};

const categoryIcon = { snowflake: Snowflake, fridge: Refrigerator } as const;

export default async function ServicesPage({
  searchParams,
}: PageProps<"/services">) {
  const params = await searchParams;
  const requested = Array.isArray(params.category) ? params.category[0] : params.category;
  const activeCategory: ServiceCategoryId =
    requested === "refrigeration" ? "refrigeration" : "air-conditioning";

  const activeServices = getServicesByCategory(activeCategory);

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Services</span>
        </div>
      </div>

      <div className="container-ags py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              AGS services
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
              Our Services
            </h1>
            <p className="mt-3 text-slate-600">
              Professional air conditioning and refrigeration services tailored
              to your needs. No prices are shown online; AGS confirms scope and
              requirements before work begins.
            </p>
          </div>
          <div className="relative hidden aspect-16/10 overflow-hidden rounded-2xl shadow-xl shadow-navy-900/10 lg:block">
            <FadeInImage
              src={
                activeCategory === "air-conditioning"
                  ? "/images/services/outdoor-condenser-units.png"
                  : "/images/services/commercial-refrigeration.png"
              }
              alt={`${categoryMeta(activeCategory)} service equipment`}
              fill
              priority
              sizes="420px"
              className="object-cover ags-image-reveal"
            />
            <div className="absolute inset-0 bg-linear-to-t from-navy-950/45 to-transparent" />
          </div>
        </div>

        <div className="mt-8 inline-flex rounded-xl border border-slate-200 bg-slate-25 p-1">
          {serviceCategories.map((category) => {
            const Icon = categoryIcon[category.icon];
            const isActive = category.id === activeCategory;
            return (
              <Link
                key={category.id}
                href={`/services?category=${category.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-navy-800"
                )}
              >
                <Icon className="size-4" />
                {category.name}
              </Link>
            );
          })}
        </div>

        <p className="mt-5 max-w-2xl text-sm text-slate-500">
          {serviceCategories.find((c) => c.id === activeCategory)?.shortDescription}
        </p>

        <ServiceGrid services={activeServices} className="mt-8" />

        <div className="mt-14 rounded-2xl border border-brand-100 bg-sky-50 p-8 text-center shadow-sm shadow-brand-100 sm:p-10">
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
        </div>
      </div>
    </div>
  );
}

function categoryMeta(categoryId: ServiceCategoryId) {
  return categoryId === "air-conditioning" ? "Air conditioning" : "Refrigeration";
}
