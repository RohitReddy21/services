"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthCard from "@/components/auth/auth-card";
import GoogleAuthLink from "@/components/auth/google-auth-link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { loginSchema } from "@/lib/validation/auth";
import { googleAuthUrl } from "@/lib/api/auth-client";

function oauthErrorMessage(error: string | null) {
  if (error === "google_oauth_unavailable") {
    return "Google sign in is not configured yet. Please use email and password for now.";
  }
  if (error === "google_oauth_failed") {
    return "Google sign in could not be completed. Please try again or use email and password.";
  }
  return null;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, completeTwoFactorLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const redirectTo = searchParams.get("redirect") ?? "/account";
  const errorRedirect = searchParams.get("redirect")
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";
  const registerHref = searchParams.get("redirect")
    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
    : "/register";
  const oauthError = oauthErrorMessage(searchParams.get("error"));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
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
      const loginResult = await login(result.data.email, result.data.password);
      if (loginResult.requiresTwoFactor) {
        setPendingToken(loginResult.pendingToken);
        return;
      }
      router.push(searchParams.get("redirect") ?? "/account");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTwoFactorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingToken) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await completeTwoFactorLogin(pendingToken, twoFactorCode.trim());
      router.push(searchParams.get("redirect") ?? "/account");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingToken) {
    return (
      <AuthCard
        title="Two-factor authentication"
        description="Enter the 6-digit code from your authenticator app, or a backup code."
      >
        <form onSubmit={handleTwoFactorSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="twofa-code" className="text-sm font-semibold text-navy-800">
              Verification Code
            </label>
            <input
              id="twofa-code"
              type="text"
              inputMode="numeric"
              autoFocus
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="123456"
              className="input-field mt-1.5 text-center text-lg tracking-[0.3em]"
            />
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting || !twoFactorCode}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Verify
          </Button>

          <button
            type="button"
            onClick={() => {
              setPendingToken(null);
              setTwoFactorCode("");
              setFormError(null);
            }}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-navy-800"
          >
            Back to login
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to manage your bookings and account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={registerHref} className="font-semibold text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </>
      }
    >
      <GoogleAuthLink href={googleAuthUrl({ redirect: redirectTo, errorRedirect })}>
        Continue with Google
      </GoogleAuthLink>

      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Or continue with email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

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
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-navy-800">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
        </div>

        {(formError || oauthError) && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {formError ?? oauthError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Log In
        </Button>
      </form>
    </AuthCard>
  );
}
