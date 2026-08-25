import Logo from "@/components/navigation/logo";
import { cn } from "@/lib/utils";

export function PageLoader({
  compact = false,
  label = "Advanced Gas Solutions",
}: {
  compact?: boolean;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-white",
        compact ? "min-h-48" : "min-h-screen"
      )}
      role="status"
      aria-label="Loading AGS"
    >
      <div className="flex w-full max-w-xs flex-col items-center px-8 text-center">
        <Logo showTagline={false} className="pointer-events-none" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
          {label}
        </p>
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-brand-100">
          <div className="ags-loader-line h-full rounded-full bg-brand-500" />
        </div>
      </div>
    </div>
  );
}

export function PageRouteLoader({ label = "Loading page" }: { label?: string }) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4">
          <div className="h-3 w-40 rounded-full bg-slate-200 ags-shimmer" />
        </div>
      </div>
      <PageLoader compact label={label} />
    </div>
  );
}

export function SectionLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-navy-900/5",
        className
      )}
      role="status"
      aria-label="Loading section"
    >
      <div className="h-4 w-32 rounded-full bg-slate-200 ags-shimmer" />
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ServicesPageLoader() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4">
          <div className="h-3 w-32 rounded-full bg-slate-200 ags-shimmer" />
        </div>
      </div>
      <div className="container-ags py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="h-6 w-36 rounded-full bg-brand-100 ags-shimmer" />
            <div className="mt-5 h-10 w-72 max-w-full rounded-full bg-slate-200 ags-shimmer sm:h-14" />
            <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-slate-100 ags-shimmer" />
            <div className="mt-2 h-4 w-4/5 max-w-lg rounded-full bg-slate-100 ags-shimmer" />
          </div>
          <ImageSkeleton className="hidden aspect-16/10 rounded-2xl lg:block" />
        </div>
        <div className="mt-8 flex gap-2">
          <div className="h-11 w-36 rounded-xl bg-slate-100 ags-shimmer" />
          <div className="h-11 w-36 rounded-xl bg-slate-100 ags-shimmer" />
        </div>
        <ServiceGridLoader className="mt-8" />
      </div>
    </div>
  );
}

export function ServiceDetailLoader() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4">
          <div className="h-3 w-64 max-w-full rounded-full bg-slate-200 ags-shimmer" />
        </div>
      </div>
      <div className="bg-ink-950">
        <div className="container-ags grid gap-10 py-16 lg:grid-cols-[1fr_360px] lg:items-end lg:py-24">
          <div>
            <div className="h-6 w-40 rounded-full bg-white/15 ags-shimmer" />
            <div className="mt-5 h-12 w-full max-w-2xl rounded-full bg-white/20 ags-shimmer sm:h-16" />
            <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-white/15 ags-shimmer" />
            <div className="mt-2 h-4 w-3/4 max-w-lg rounded-full bg-white/15 ags-shimmer" />
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
            <div className="h-11 w-11 rounded-xl bg-white/30 ags-shimmer" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-3 rounded-full bg-white/20 ags-shimmer" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container-ags grid gap-10 py-10 lg:grid-cols-[1fr_360px] lg:py-14">
        <SectionLoader />
        <CardSkeleton className="h-fit" />
      </div>
    </div>
  );
}

export function ServiceGridLoader({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: 8 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-slate-100 ags-shimmer",
        className
      )}
      role="status"
      aria-label="Loading image"
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-navy-900/5",
        className
      )}
      role="status"
      aria-label="Loading card"
    >
      <div className="aspect-4/3 rounded-xl bg-slate-100 ags-shimmer" />
      <div className="mt-4 h-3 w-2/3 rounded-full bg-slate-200 ags-shimmer" />
      <div className="mt-2 h-3 w-full rounded-full bg-slate-100 ags-shimmer" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-100 ags-shimmer" />
    </div>
  );
}

export function BookingPageLoader() {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-slate-25 px-5 py-8">
      <div className="mx-auto mb-6 h-3 w-64 max-w-full rounded-full bg-slate-200 ags-shimmer" />
      <BookingSkeleton />
    </div>
  );
}

export function BookingSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-navy-900/5"
      role="status"
      aria-label="Loading booking form"
    >
      <div className="h-5 w-44 rounded-full bg-slate-200 ags-shimmer" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-slate-100 ags-shimmer" />
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <div className="h-10 w-24 rounded-lg bg-slate-100 ags-shimmer" />
        <div className="h-10 w-32 rounded-lg bg-brand-100 ags-shimmer" />
      </div>
    </div>
  );
}

export function AccountPageLoader() {
  return (
    <div className="bg-slate-25 py-8">
      <div className="container-ags grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-navy-900/5 lg:block">
          <div className="h-9 w-40 rounded-full bg-slate-200 ags-shimmer" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 rounded-xl bg-slate-100 ags-shimmer" />
            ))}
          </div>
        </aside>
        <main>
          <div className="h-8 w-56 rounded-full bg-slate-200 ags-shimmer" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-navy-900/5">
                <div className="h-4 w-20 rounded-full bg-slate-200 ags-shimmer" />
                <div className="mt-5 h-7 w-24 rounded-full bg-brand-100 ags-shimmer" />
              </div>
            ))}
          </div>
          <SectionLoader className="mt-6" />
        </main>
      </div>
    </div>
  );
}

export function SubscriptionsPageLoader() {
  return (
    <div className="bg-white py-10 lg:py-14">
      <div className="container-ags">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto h-6 w-32 rounded-full bg-brand-100 ags-shimmer" />
          <div className="mx-auto mt-5 h-11 w-80 max-w-full rounded-full bg-slate-200 ags-shimmer" />
          <div className="mx-auto mt-4 h-4 w-full rounded-full bg-slate-100 ags-shimmer" />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} className="min-h-72" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThreeDLoader() {
  return (
    <div
      className="flex min-h-72 items-center justify-center rounded-2xl border border-brand-100 bg-white/70 shadow-inner shadow-brand-100"
      role="status"
      aria-label="Loading 3D model"
    >
      <div className="text-center">
        <div className="mx-auto size-14 rounded-full border border-brand-200 bg-brand-50 ags-pulse-ring" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Loading engineered view
        </p>
      </div>
    </div>
  );
}
