import type { ReactNode } from "react";
import Logo from "@/components/navigation/logo";

export default function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div aria-hidden="true" className="ags-blueprint absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-120 rounded-full bg-brand-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-accent-gold-500/10 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center">
          <Logo showTagline={false} />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/40 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
      </div>
    </div>
  );
}
