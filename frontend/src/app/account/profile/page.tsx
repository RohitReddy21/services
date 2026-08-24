import type { Metadata } from "next";
import ProfileForm from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">Profile</h1>
      <p className="mt-1.5 text-sm text-slate-500">Manage your personal details.</p>
      <div className="mt-6 max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  );
}
