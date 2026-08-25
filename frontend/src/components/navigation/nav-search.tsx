"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { services } from "@/lib/data/services";

const MAX_RESULTS = 6;

export default function NavSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmedQuery) return [];
    return services
      .filter((service) =>
        `${service.name} ${service.shortDescription}`.toLowerCase().includes(trimmedQuery)
      )
      .slice(0, MAX_RESULTS);
  }, [trimmedQuery]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeAndReset = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedQuery) return;
    router.push(`/services?q=${encodeURIComponent(query.trim())}`);
    closeAndReset();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Search services"
        onClick={() => setOpen((v) => !v)}
        className="ags-focus flex size-9 items-center justify-center rounded-lg text-navy-800 transition-colors hover:bg-slate-100"
      >
        <Search className="size-4.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-10 mt-2 w-80 sm:w-96"
          >
            <div className="rounded-xl border border-brand-100 bg-white p-3 shadow-xl shadow-navy-900/10">
              <form onSubmit={handleSubmit} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search services..."
                  aria-label="Search services"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-25 pl-9 pr-8 text-sm text-navy-900 placeholder:text-slate-400 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                />
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-navy-700"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </form>

              {trimmedQuery.length > 0 && (
                <div className="mt-2">
                  {results.length > 0 ? (
                    <>
                      <ul className="max-h-72 overflow-y-auto">
                        {results.map((service) => (
                          <li key={service.id}>
                            <Link
                              href={`/services/${service.categoryId}/${service.slug}`}
                              onClick={closeAndReset}
                              className="ags-focus block rounded-lg px-2.5 py-2 transition-colors hover:bg-brand-50"
                            >
                              <p className="text-sm font-semibold text-navy-800">{service.name}</p>
                              <p className="line-clamp-1 text-xs text-slate-500">
                                {service.shortDescription}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/services?q=${encodeURIComponent(query.trim())}`}
                        onClick={closeAndReset}
                        className="ags-focus mt-1 flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                      >
                        View all results
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </>
                  ) : (
                    <p className="px-2.5 py-3 text-sm text-slate-500">
                      No services match &quot;{query.trim()}&quot;.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
