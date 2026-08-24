import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Privacy Policy</span>
        </div>
      </div>

      <div className="container-ags py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-400">Last updated: August 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-600">
            <Section title="1. Information We Collect">
              When you create an account, submit a booking, or subscribe to
              a Care Plan, we collect your name, email address, phone
              number, service address, and details about the equipment and
              service you need — including any photos you choose to upload.
            </Section>
            <Section title="2. How We Use Your Information">
              We use this information to process your booking or
              subscription, communicate with you about your appointments,
              maintain your account, and improve our service. We do not
              sell your personal information.
            </Section>
            <Section title="3. Photos You Upload">
              Photos submitted with a booking are used only to help our
              engineers prepare for the visit, and are retained only as
              long as needed for that purpose.
            </Section>
            <Section title="4. Data Storage & Security">
              Your account is protected with a securely hashed password and
              session tokens stored in HTTP-only cookies. We take reasonable
              technical measures to protect your data.
            </Section>
            <Section title="5. Your Rights">
              You can view and update your personal details from your
              account at any time. To request deletion of your account or
              data, contact us using the details below.
            </Section>
            <Section title="6. Cookies">
              We use strictly necessary cookies to keep you signed in and
              secure your session. We do not use third-party advertising
              cookies.
            </Section>
            <Section title="7. Contact">
              For privacy questions or data requests, contact{" "}
              <a href="mailto:info@agsolutions.co.uk" className="font-semibold text-brand-600 hover:text-brand-700">
                info@agsolutions.co.uk
              </a>
              .
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-base font-bold text-navy-900">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
