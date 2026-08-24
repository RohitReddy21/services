"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { updateProfileRequest } from "@/lib/api/account-client";

export default function ProfileForm() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [emailPref, setEmailPref] = useState(user?.notificationPreferences.email ?? true);
  const [smsPref, setSmsPref] = useState(user?.notificationPreferences.sms ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await updateProfileRequest({
        name,
        phone,
        notificationPreferences: { email: emailPref, sms: smsPref },
      });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold text-navy-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-800">Email Address</span>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-field mt-1.5 bg-slate-50 text-slate-400"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-navy-800">Phone Number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field mt-1.5"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-navy-900">Notification Preferences</h2>
        <div className="mt-4 space-y-3">
          <Toggle label="Email notifications" checked={emailPref} onChange={setEmailPref} />
          <Toggle label="SMS notifications" checked={smsPref} onChange={setSmsPref} />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">{error}</p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-lg bg-accent-green-50 px-3.5 py-2.5 text-sm font-medium text-accent-green-700">
          <CheckCircle2 className="size-4" />
          Profile updated.
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm text-navy-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
