import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ServicesExplorer from "@/components/services/services-explorer";
import FadeInImage from "@/components/ui/fade-in-image";
import { services, serviceCategories } from "@/lib/data/services";
import type { ServiceCategoryId } from "@/types/service";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Browse all AGS air conditioning and refrigeration services — installation, repairs, servicing and maintenance for homes and businesses across the UK.",
};

export default async function ServicesPage({
  searchParams,
}: PageProps<"/services">) {
  const params = await searchParams;
  const requested = Array.isArray(params.category) ? params.category[0] : params.category;
  const activeCategory: ServiceCategoryId =
    requested === "refrigeration" ? "refrigeration" : "air-conditioning";
  const requestedQuery = Array.isArray(params.q) ? params.q[0] : params.q;

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

        <div className="mt-8">
          <ServicesExplorer
            allServices={services}
            categories={serviceCategories}
            initialCategory={activeCategory}
            initialQuery={requestedQuery ?? ""}
          />
        </div>

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
