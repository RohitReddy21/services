import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact/contact-form";
import JsonLd from "@/components/seo/json-ld";
import Reveal from "@/components/ui/reveal";
import PageHero from "@/components/ui/page-hero";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { ORG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with AGS Air Conditioning & Refrigeration Ltd for air conditioning and refrigeration enquiries across the UK.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "Contact Us" },
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <JsonLd
        id="ld-page"
        data={webPageSchema({
          name: "Contact AGS",
          description: "Contact AGS Air Conditioning & Refrigeration Ltd for AC and refrigeration enquiries.",
          path: "/contact",
          type: "ContactPage",
        })}
      />
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageHero
        crumb="Contact"
        eyebrow="Contact"
        title="Get in"
        highlight="touch."
        description="Questions about a service, a booking, or a Care Plan? Our team is here to help."
      />

      <div className="container-ags py-12 lg:py-16">

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <Reveal variant="left" className="space-y-4">
            <ContactInfoCard icon={Phone} title="Phone">
              <div className="flex flex-col gap-1">
                {ORG.phones.map((phone) => (
                  <a key={phone.href} href={phone.href} className="hover:text-brand-600">
                    {phone.display}
                  </a>
                ))}
              </div>
            </ContactInfoCard>
            <ContactInfoCard icon={Mail} title="Email">
              <a href={`mailto:${ORG.email}`} className="hover:text-brand-600">
                {ORG.email}
              </a>
            </ContactInfoCard>
            <ContactInfoCard icon={MapPin} title="Business Address">
              {ORG.addressLine}
            </ContactInfoCard>
            <ContactInfoCard icon={Clock3} title="Opening Hours">
              Mon &ndash; Sat, 8:00 AM &ndash; 6:00 PM
            </ContactInfoCard>
          </Reveal>

          <Reveal variant="right" delay={0.08}>
            <ContactForm />
          </Reveal>
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
