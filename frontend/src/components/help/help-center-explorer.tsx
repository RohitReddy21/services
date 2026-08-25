"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { HelpFaq } from "@/lib/data/help-center";
import { cn } from "@/lib/utils";

export default function HelpCenterExplorer({
  faqs,
  topics,
  initialTopic = null,
}: {
  faqs: HelpFaq[];
  topics: string[];
  initialTopic?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(initialTopic);

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    // Space-insensitive fallback so "rollover" still matches copy that reads "roll over".
    const queryNoSpaces = trimmedQuery.replace(/\s+/g, "");
    return faqs.filter((faq) => {
      if (topic && faq.topic !== topic) return false;
      if (!trimmedQuery) return true;
      const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
      return haystack.includes(trimmedQuery) || haystack.replace(/\s+/g, "").includes(queryNoSpaces);
    });
  }, [faqs, topic, trimmedQuery]);

  return (
    <div>
      <label className="relative mx-auto block max-w-xl">
        <span className="sr-only">Search help articles</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search for answers..."
          aria-label="Search help articles"
          className="input-field h-12 w-full pl-11 pr-9"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="ags-focus absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-navy-700"
          >
            <X className="size-3.5" />
          </button>
        )}
      </label>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setTopic(null)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            topic === null
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-slate-200 text-slate-500 hover:border-brand-200"
          )}
        >
          All Topics
        </button>
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              topic === t
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-500 hover:border-brand-200"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
        {results.length} article{results.length === 1 ? "" : "s"}
      </p>

      {results.length === 0 ? (
        <div className="mx-auto mt-4 max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-25 p-8 text-center">
          <p className="text-sm font-semibold text-navy-800">No matching articles</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search term or topic.</p>
        </div>
      ) : (
        <div className="mx-auto mt-4 max-w-3xl divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {results.map((faq) => (
            <details key={faq.id} className="group p-5">
              <summary className="ags-focus flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-semibold text-navy-900 marker:content-none">
                <span>{faq.question}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 group-open:bg-brand-50 group-open:text-brand-700">
                  {faq.topic}
                </span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
