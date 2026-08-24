import type { Metadata } from "next";
import AddressesManager from "@/components/account/addresses-manager";

export const metadata: Metadata = {
  title: "Saved Addresses",
};

export default function AddressesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
        Saved Addresses
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">Manage the addresses we can service.</p>
      <div className="mt-6">
        <AddressesManager />
      </div>
    </div>
  );
}
