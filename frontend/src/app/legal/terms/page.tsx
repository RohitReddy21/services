import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Terms & Conditions</span>
        </div>
      </div>

      <div className="container-ags py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-900">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-400">Last updated: August 2026</p>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-slate-600">
            <Section title="1. About These Terms">
              These terms govern your use of the AGS (Advanced Gas Solutions)
              website and booking platform. By submitting a booking request
              or creating an account, you agree to these terms.
            </Section>
            <Section title="2. Service Requests, Not Fixed-Price Contracts">
              Submitting a booking or Care Plan subscription through this
              platform is a request for service, not a confirmed, priced
              contract. No pricing is displayed on this platform. Our team
              will contact you to confirm appointment details and any
              applicable charges before work begins.
            </Section>
            <Section title="3. Account Responsibilities">
              You are responsible for keeping your account credentials
              secure and for the accuracy of the information you provide,
              including your service address and contact details.
            </Section>
            <Section title="4. Cancellations & Rescheduling">
              You may request to cancel or reschedule a booking or Care Plan
              from your account at any time before the service is completed.
              Requests are subject to confirmation by our team.
            </Section>
            <Section title="5. Care Plans">
              Care Plan subscriptions provide a recurring visit schedule as
              described on the plan. Visit dates shown in your account are
              estimates; our team will confirm each visit individually. You
              may pause or cancel a plan at any time from your account.
            </Section>
            <Section title="6. Liability">
              While we take care to deliver a high standard of work, AGS is
              not liable for indirect or consequential losses arising from
              service delays, except where required by law.
            </Section>
            <Section title="7. Contact">
              Questions about these terms can be sent to{" "}
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
