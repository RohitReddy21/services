"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/navigation/logo";
import { useAuth } from "@/components/auth/auth-context";
import { fetchEngineerStats, setAvailabilityRequest } from "@/lib/api/technician-client";
import { cn } from "@/lib/utils";

export default function TechnicianHeader({ engineerName }: { engineerName: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEngineerStats()
      .then((stats) => setAvailable(stats.isAvailable))
      .catch(() => setAvailable(null));
  }, []);

  const toggleAvailable = async () => {
    if (available === null || saving) return;
    const next = !available;
    setSaving(true);
    setAvailable(next); // optimistic, this is a simple on/off flag
    try {
      await setAvailabilityRequest(next);
    } catch {
      setAvailable(!next); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo showTagline={false} className="scale-90 origin-left" />
          <span className="hidden rounded-full bg-navy-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white sm:inline">
            Engineer
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {available !== null && (
            <button
              type="button"
              onClick={toggleAvailable}
              disabled={saving}
              className={cn(
                "ags-focus inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-60",
                available
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              )}
              aria-pressed={available}
              title={available ? "Available for new jobs, tap to go off-duty" : "Off-duty, tap to become available"}
            >
              <span
                className={cn("size-1.5 rounded-full", available ? "bg-green-500" : "bg-slate-400")}
              />
              {available ? "Available" : "Off-duty"}
            </button>
          )}
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
