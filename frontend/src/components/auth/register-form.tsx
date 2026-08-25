"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthCard from "@/components/auth/auth-card";
import GoogleAuthLink from "@/components/auth/google-auth-link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { registerSchema } from "@/lib/validation/auth";
import { googleAuthUrl } from "@/lib/api/auth-client";

function oauthErrorMessage(error: string | null) {
  if (error === "google_oauth_unavailable") {
    return "Google sign up is not configured yet. Please create an account with email for now.";
  }
  if (error === "google_oauth_failed") {
    return "Google sign up could not be completed. Please try again or create an account with email.";
  }
  return null;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = searchParams.get("redirect") ?? "/account";
  const loginHref = searchParams.get("redirect")
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";
  const errorRedirect = searchParams.get("redirect")
    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
    : "/register";
  const oauthError = oauthErrorMessage(searchParams.get("error"));
  const referralCode = searchParams.get("ref")?.trim().toUpperCase() || undefined;

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[issue.path[0] as string] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await register({ ...result.data, referralCode });
      router.push(redirectTo);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description="Book services and track your appointments in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      {referralCode && (
        <p className="mb-4 rounded-lg bg-accent-green-50 px-3.5 py-2.5 text-xs font-semibold text-accent-green-700">
          You&apos;ve been referred with code {referralCode} — you&apos;ll both earn reward points once you sign up.
        </p>
      )}

      <GoogleAuthLink href={googleAuthUrl({ redirect: redirectTo, errorRedirect })}>
        Sign up with Google
      </GoogleAuthLink>

      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Or use email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Full Name" error={fieldErrors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Smith"
            className="input-field"
          />
        </Field>

        <Field label="Email Address" error={fieldErrors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@example.com"
            className="input-field"
          />
        </Field>

        <Field label="Phone Number" error={fieldErrors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="07123 456789"
            className="input-field"
          />
        </Field>

        <Field label="Password" error={fieldErrors.password}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 8 characters"
              className="input-field pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Field label="Confirm Password" error={fieldErrors.confirmPassword}>
          <input
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            placeholder="Re-enter your password"
            className="input-field"
          />
        </Field>

        {(formError || oauthError) && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {formError ?? oauthError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Create Account
        </Button>

        <p className="text-center text-xs text-slate-400">
          By signing up you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-slate-600">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy-800">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}
