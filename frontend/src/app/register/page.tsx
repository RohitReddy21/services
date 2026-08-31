import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an AGS account to book and manage air conditioning and refrigeration services.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
