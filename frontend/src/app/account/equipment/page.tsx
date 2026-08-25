import type { Metadata } from "next";
import EquipmentManager from "@/components/account/equipment-manager";

export const metadata: Metadata = {
  title: "My Equipment",
};

export default function EquipmentPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
        My Equipment
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Save your AC units and refrigeration equipment for faster bookings and a full service history.
      </p>
      <div className="mt-6">
        <EquipmentManager />
      </div>
    </div>
  );
}
