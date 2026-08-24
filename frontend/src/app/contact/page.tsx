import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with AGS - Advanced Gas Solutions for air conditioning and refrigeration enquiries across the UK.",
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Contact</span>
        </div>
      </div>

      <div className="container-ags py-12 lg:py-16">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-3 text-slate-600">
            Questions about a service, a booking, or a Care Plan? Our team is
            here to help.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <ContactInfoCard icon={Phone} title="Phone">
              <a href="tel:02079460018" className="hover:text-brand-600">020 7946 0018</a>
            </ContactInfoCard>
            <ContactInfoCard icon={Mail} title="Email">
              <a href="mailto:info@agsolutions.co.uk" className="hover:text-brand-600">
                info@agsolutions.co.uk
              </a>
            </ContactInfoCard>
            <ContactInfoCard icon={MapPin} title="Business Address">
              13 Baker Street, London, W1U 3BW
            </ContactInfoCard>
            <ContactInfoCard icon={Clock3} title="Opening Hours">
              Mon &ndash; Sat, 8:00 AM &ndash; 6:00 PM
            </ContactInfoCard>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ContactInfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-4.5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-navy-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-600">{children}</p>
      </div>
    </div>
  );
}
