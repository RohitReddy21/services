import type { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an AGS account to book and manage air conditioning and refrigeration services.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
