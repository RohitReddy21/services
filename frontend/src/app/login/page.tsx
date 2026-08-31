import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your AGS account to manage bookings and your profile.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
