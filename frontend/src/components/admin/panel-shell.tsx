"use client";

import { useEffect, type ComponentType, type ReactNode } from "react";
import { RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Consistent header for every admin panel: title, count, and right-aligned actions. */
export function PanelHeader({
  title,
  subtitle,
  count,
  onRefresh,
  refreshing,
  actions,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {count}
            </span>
          )}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="ags-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          </button>
        )}
      </div>
    </div>
  );
}

/** KPI tile for the overview grid. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "brand" | "green" | "gold" | "slate" | "amber";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-accent-green-50 text-accent-green-600",
    gold: "bg-accent-gold-400/20 text-accent-gold-600",
    slate: "bg-slate-100 text-slate-500",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 ags-depth-sm ags-lift-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-navy-900">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>}
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

/** Placeholder rows while a list loads. */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm">
          <div className="h-3 w-24 rounded-full bg-slate-200 ags-shimmer" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-100 ags-shimmer" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-100 ags-shimmer" />
        </div>
      ))}
    </div>
  );
}

/** Centered dialog used by every admin create/edit form. */
export function AdminModal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy-950/40 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "my-8 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-navy-900/20",
          wide ? "max-w-2xl" : "max-w-lg"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="ags-focus flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Labelled form control for admin modals. */
export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

/** Two-column responsive grid for form fields. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

/** "Show archived" checkbox used on list panels. */
export function ArchiveToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
      />
      Show archived
    </label>
  );
}
