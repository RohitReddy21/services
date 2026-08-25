import type { Metadata } from "next";
import ReferralManager from "@/components/account/referral-manager";

export const metadata: Metadata = {
  title: "Refer a Friend",
};

export default function ReferralsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
        Refer a Friend
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Share AGS with friends and family and you&apos;ll both be rewarded.
      </p>
      <div className="mt-6">
        <ReferralManager />
      </div>
    </div>
  );
}
