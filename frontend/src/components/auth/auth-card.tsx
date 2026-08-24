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
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-sky-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo showTagline={false} />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-navy-900/5 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold text-navy-900">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  );
}
