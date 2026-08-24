"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { checkPostcodeCoverage } from "@/lib/data/service-areas";
import type { ServiceArea } from "@/lib/data/service-areas";

export default function PostcodeChecker({ initialPostcode }: { initialPostcode?: string }) {
  const [postcode, setPostcode] = useState(initialPostcode ?? "");
  const [result, setResult] = useState<{ area: ServiceArea | null } | null>(null);

  useEffect(() => {
    if (initialPostcode?.trim()) {
      const task = window.setTimeout(() => {
        setResult({ area: checkPostcodeCoverage(initialPostcode) });
      }, 0);
      return () => window.clearTimeout(task);
    }
  }, [initialPostcode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;
    setResult({ area: checkPostcodeCoverage(postcode) });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold text-navy-900">Check Your Postcode</h2>
      <p className="mt-1 text-sm text-slate-500">
        See if AGS covers your area — this is a quick check; our team will
        confirm full details when you book.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={postcode}
          onChange={(e) => {
            setPostcode(e.target.value.toUpperCase());
            setResult(null);
          }}
          type="text"
          placeholder="Enter your postcode"
          aria-label="Enter your postcode"
          className="input-field flex-1"
        />
        <Button type="submit" size="lg" className="shrink-0">
          <Search className="size-4" />
          Check Availability
        </Button>
      </form>

      {result && (
        <div className="mt-4">
          {result.area ? (
            <div className="flex items-start gap-2.5 rounded-lg bg-accent-green-50 px-4 py-3 text-sm text-accent-green-800">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>
                Good news — we cover <strong>{result.area.city}</strong> and
                the surrounding area.{" "}
                <ButtonLink href="/book" size="sm" className="mt-2 sm:mt-0 sm:ml-2 sm:inline-flex">
                  Book a Service
                </ButtonLink>
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                We couldn&apos;t automatically match that postcode to a
                listed area — contact us and we&apos;ll confirm whether we
                can help.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
