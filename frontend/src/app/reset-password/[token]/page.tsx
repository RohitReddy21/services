import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
}: PageProps<"/reset-password/[token]">) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
