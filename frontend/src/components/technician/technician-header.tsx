"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/navigation/logo";
import { useAuth } from "@/components/auth/auth-context";

export default function TechnicianHeader({ engineerName }: { engineerName: string }) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo showTagline={false} className="scale-90 origin-left" />
          <span className="hidden rounded-full bg-navy-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white sm:inline">
            Engineer
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden max-w-32 truncate text-sm text-slate-500 sm:inline">
            {engineerName}
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {engineerName.charAt(0).toUpperCase()}
          </span>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="ags-focus inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
