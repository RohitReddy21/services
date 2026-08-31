"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { ANALYTICS } from "@/lib/site";
import { CONSENT_STORAGE_KEY } from "@/components/analytics/analytics";

type Choice = "granted" | "denied";

function setConsent(choice: Choice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* storage unavailable — consent stays session-only */
  }
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
  w.gtag?.("consent", "update", {
    analytics_storage: choice === "granted" ? "granted" : "denied",
  });
}

/**
 * Minimal PECR/GDPR-friendly banner. Only shown when analytics is actually
 * configured and the visitor hasn't chosen yet. Pairs with the Consent Mode
 * v2 defaults in <Analytics/>.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const analyticsEnabled = Boolean(ANALYTICS.gaId || ANALYTICS.gtmId);

  useEffect(() => {
    if (!analyticsEnabled) return;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [analyticsEnabled]);

  if (!visible) return null;

  const choose = (choice: Choice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-60 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-navy-900/15 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Cookie className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-900">We use analytics cookies</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            They help us understand how the site is used so we can improve it.
            Nothing is set until you accept. See our{" "}
            <a href="/legal/privacy" className="font-semibold text-brand-600 hover:text-brand-700">
              Privacy Policy
            </a>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => choose("granted")}
              className="ags-focus rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="ags-focus rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
