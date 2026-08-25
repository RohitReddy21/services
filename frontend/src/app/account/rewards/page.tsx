import type { Metadata } from "next";
import RewardsManager from "@/components/account/rewards-manager";

export const metadata: Metadata = {
  title: "Rewards",
};

export default function RewardsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
        Rewards
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Earn points for every booking and Care Plan subscription, then redeem them for service credit.
      </p>
      <div className="mt-6">
        <RewardsManager />
      </div>
    </div>
  );
}
