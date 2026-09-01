"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Refrigerator, Search, Snowflake, X, Zap } from "lucide-react";
import ServiceGrid from "@/components/services/service-grid";
import type { ServiceCategoryId, ServiceCategory, ServiceSummary } from "@/types/service";
import { cn } from "@/lib/utils";

const categoryIcon = { snowflake: Snowflake, fridge: Refrigerator, bolt: Zap } as const;

function matchesQuery(service: ServiceSummary, query: string) {
  const haystack = `${service.name} ${service.shortDescription}`.toLowerCase();
  return haystack.includes(query);
}

export default function ServicesExplorer({
  allServices,
  categories,
  initialCategory,
  initialQuery = "",
}: {
  allServices: ServiceSummary[];
  categories: ServiceCategory[];
  initialCategory: ServiceCategoryId;
  initialQuery?: string;
}) {
  const [category, setCategory] = useState<ServiceCategoryId>(initialCategory);
  const [query, setQuery] = useState(initialQuery);

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const results = useMemo(() => {
    if (isSearching) {
      return allServices.filter((service) => matchesQuery(service, trimmedQuery));
    }
    return allServices.filter((service) => service.categoryId === category);
  }, [allServices, category, isSearching, trimmedQuery]);

  const activeCategoryMeta = categories.find((c) => c.id === category);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-25 p-1 sm:inline-flex sm:w-auto sm:gap-0">
          {categories.map((c) => {
            const Icon = categoryIcon[c.icon];
            const isActive = !isSearching && c.id === category;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight transition-colors sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm",
                  isActive
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-navy-800"
                )}
              >
                <Icon className="hidden size-4 shrink-0 sm:block" />
                {c.name}
              </button>
            );
          })}
        </div>

        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search services</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search services..."
            aria-label="Search services"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-navy-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="ags-focus absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-navy-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      <p className="mt-5 max-w-2xl text-sm text-slate-500">
        {isSearching
          ? `${results.length} service${results.length === 1 ? "" : "s"} matching "${query.trim()}"`
          : activeCategoryMeta?.shortDescription}
      </p>

      {results.length > 0 ? (
        <ServiceGrid services={results} className="mt-8" />
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-25 p-10 text-center">
          <p className="text-sm font-semibold text-navy-800">
            No services match &quot;{query.trim()}&quot;
          </p>
          <p className="mt-1.5 text-sm text-slate-500">
            Try a different term, or{" "}
            <Link href="/contact" className="font-semibold text-brand-600 hover:text-brand-700">
              contact us
            </Link>{" "}
            and we&apos;ll point you in the right direction.
          </p>
        </div>
      )}
    </div>
  );
}
