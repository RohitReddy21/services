"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import AuthCard from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { forgotPasswordRequest } from "@/lib/api/auth-client";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewResetUrl, setPreviewResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setFieldError(null);

    setSubmitting(true);
    try {
      const res = await forgotPasswordRequest(result.data.email);
      setSent(true);
      setPreviewResetUrl(res.previewResetUrl ?? null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-green-100 text-accent-green-600">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to
            reset your password.
          </p>

          {previewResetUrl && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-left text-xs text-amber-800">
              <p className="font-semibold">Development Preview</p>
              <p className="mt-1">
                Email sending isn&apos;t connected yet, so here&apos;s your reset link:
              </p>
              <Link href={previewResetUrl} className="mt-1.5 block break-all font-semibold underline">
                {previewResetUrl}
              </Link>
            </div>
          )}

          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Back to log in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-navy-800">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="input-field mt-1.5"
          />
          {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
        </div>

        {formError && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>
    </AuthCard>
  );
}
