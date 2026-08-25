import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import HelpCenterExplorer from "@/components/help/help-center-explorer";
import { helpCenterFaqs, helpCenterTopics } from "@/lib/data/help-center";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Answers to common questions about bookings, Care Plans, rewards, referrals and more — search the AGS Help Center.",
};

export default function HelpCenterPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Help Center</span>
        </div>
      </div>

      <div className="container-ags py-10 lg:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <LifeBuoy className="size-3.5" />
            Help Center
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-3 text-slate-600">
            Search common questions about bookings, Care Plans, rewards and more.
          </p>
        </div>

        <div className="mt-10">
          <HelpCenterExplorer faqs={helpCenterFaqs} topics={helpCenterTopics} />
        </div>

        <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-brand-100 bg-sky-50 p-8 text-center shadow-sm shadow-brand-100">
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
        </div>
      </div>
    </div>
  );
}
