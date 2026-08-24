import { cn } from "@/lib/utils";

export default function GoogleAuthLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "ags-focus flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-navy-800 shadow-sm shadow-navy-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md hover:shadow-brand-100",
        className
      )}
    >
      <GoogleMark />
      {children}
    </a>
  );
}

function GoogleMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 items-center justify-center rounded-full bg-white text-sm font-black text-brand-600 shadow-inner shadow-slate-200"
    >
      G
    </span>
  );
}
