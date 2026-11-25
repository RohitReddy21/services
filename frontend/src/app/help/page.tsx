import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HelpCenterExplorer from "@/components/help/help-center-explorer";
import JsonLd from "@/components/seo/json-ld";
import Reveal from "@/components/ui/reveal";
import PageHero from "@/components/ui/page-hero";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { helpCenterFaqs, helpCenterTopics } from "@/lib/data/help-center";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Answers to common questions about bookings, Care Plans, rewards, referrals and more, search the AGS Help Center.",
  alternates: { canonical: "/help" },
  openGraph: {
    url: "/help",
    title: "Help Center",
    description:
      "Answers to common questions about bookings, Care Plans, rewards and referrals.",
  },
};

export default async function HelpCenterPage({ searchParams }: PageProps<"/help">) {
  const params = await searchParams;
  const requestedTopic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const initialTopic = helpCenterTopics.includes(requestedTopic ?? "") ? requestedTopic! : null;

  return (
    <div className="bg-white">
      <JsonLd id="ld-faq" data={faqSchema(helpCenterFaqs)} />
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Help Center", path: "/help" },
        ])}
      />
      <PageHero
        crumb="Help Center"
        eyebrow="Help Center"
        title="How can we"
        highlight="help?"
        description="Search common questions about bookings, Care Plans, rewards and more."
      />

      <div className="container-ags py-10 lg:py-14">

        <Reveal delay={0.08}>
          <HelpCenterExplorer
            faqs={helpCenterFaqs}
            topics={helpCenterTopics}
            initialTopic={initialTopic}
          />
        </Reveal>

        <Reveal
          variant="scale"
          className="mx-auto mt-14 max-w-xl rounded-2xl border border-brand-100 bg-sky-50 p-8 text-center shadow-sm shadow-brand-100"
        >
          <h2 className="font-display text-lg font-bold text-navy-900">Still need help?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Our team is happy to help with anything not covered here.
          </p>
          <Link
            href="/contact"
            className="ags-focus mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-700"
          >
            Contact Us
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
