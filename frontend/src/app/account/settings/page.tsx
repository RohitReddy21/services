import type { Metadata } from "next";
import Link from "next/link";
import ChangePasswordForm from "@/components/account/change-password-form";
import TwoFactorSettings from "@/components/account/two-factor-settings";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">Settings</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Manage your account security. For personal details and notification
        preferences, visit your{" "}
        <Link href="/account/profile" className="font-semibold text-brand-600 hover:text-brand-700">
          Profile
        </Link>
        .
      </p>

      <div className="mt-6 max-w-xl space-y-6">
        <ChangePasswordForm />
        <TwoFactorSettings />
      </div>
    </div>
  );
}
