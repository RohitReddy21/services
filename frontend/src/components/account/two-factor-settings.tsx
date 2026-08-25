"use client";

import { useState } from "react";
import { Check, Copy, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import {
  disableTwoFactorRequest,
  enableTwoFactorRequest,
  setupTwoFactorRequest,
} from "@/lib/api/twofa-client";

type Mode = "idle" | "setup" | "disable";

export default function TwoFactorSettings() {
  const { user, refresh } = useAuth();
  const [mode, setMode] = useState<Mode>("idle");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const enabled = user?.twoFactorEnabled ?? false;

  const startSetup = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await setupTwoFactorRequest();
      setQrCodeDataUrl(res.qrCodeDataUrl);
      setSecret(res.secret);
      setMode("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await enableTwoFactorRequest(code.trim());
      setBackupCodes(res.backupCodes);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setError(null);
    setLoading(true);
    try {
      await disableTwoFactorRequest(password);
      await refresh();
      setMode("idle");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    if (!backupCodes) return;
    navigator.clipboard?.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeSetup = () => {
    setMode("idle");
    setQrCodeDataUrl(null);
    setSecret(null);
    setCode("");
    setBackupCodes(null);
    setError(null);
  };

  // Post-enable: show backup codes once, since they can never be retrieved again.
  if (backupCodes) {
    return (
      <div className="rounded-2xl border border-accent-green-100 bg-accent-green-50 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-accent-green-600" />
          <h2 className="font-display text-base font-bold text-navy-900">
            Two-factor authentication enabled
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Save these backup codes somewhere safe. Each can be used once to log in if you lose access
          to your authenticator app. They won&apos;t be shown again.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white p-4 font-mono text-sm text-navy-900 sm:grid-cols-4">
          {backupCodes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopyBackupCodes}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy Codes"}
          </Button>
          <Button size="sm" onClick={closeSetup}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "setup") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-navy-900">
          Set Up Two-Factor Authentication
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password), then
          enter the 6-digit code it generates.
        </p>

        {qrCodeDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrCodeDataUrl}
            alt="Two-factor authentication QR code"
            className="mx-auto mt-4 size-44 rounded-xl border border-slate-200 p-2"
          />
        )}

        {secret && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Can&apos;t scan it? Enter this code manually:{" "}
            <span className="font-mono font-semibold text-navy-800">{secret}</span>
          </p>
        )}

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-navy-800">Verification Code</span>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="input-field mt-1.5 text-center text-lg tracking-[0.3em]"
          />
        </label>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="sm" onClick={closeSetup} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleEnable} disabled={loading || code.trim().length < 6}>
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Confirm & Enable
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "disable") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-red-700">
          Disable Two-Factor Authentication
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Confirm your password to turn off two-factor authentication.
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-navy-800">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
        {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMode("idle")} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDisable}
            disabled={loading || !password}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Disable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              enabled ? "bg-accent-green-100 text-accent-green-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            {enabled ? <ShieldCheck className="size-4.5" /> : <ShieldOff className="size-4.5" />}
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-navy-900">
              Two-Factor Authentication
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {enabled
                ? "Enabled — an authenticator app code is required to log in."
                : "Add an extra layer of security with an authenticator app."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4">
        {enabled ? (
          <Button variant="secondary" size="sm" onClick={() => setMode("disable")}>
            Disable
          </Button>
        ) : (
          <Button size="sm" onClick={startSetup} disabled={loading}>
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Enable Two-Factor Authentication
          </Button>
        )}
      </div>
    </div>
  );
}
