"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changePasswordRequest } from "@/lib/api/account-client";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="font-display text-base font-bold text-navy-900">Change Password</h2>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">Current Password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">New Password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-800">Confirm New Password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">{error}</p>
      )}
      {saved && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-accent-green-50 px-3.5 py-2.5 text-sm font-medium text-accent-green-700">
          <CheckCircle2 className="size-4" />
          Password updated.
        </p>
      )}

      <Button type="submit" size="md" className="mt-5" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Update Password
      </Button>
    </form>
  );
}
