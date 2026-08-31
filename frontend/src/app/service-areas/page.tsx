import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned } from "lucide-react";
import { serviceAreas } from "@/lib/data/service-areas";
import PostcodeChecker from "@/components/service-areas/postcode-checker";
import JsonLd from "@/components/seo/json-ld";
import Reveal, { RevealStagger, RevealItem } from "@/components/ui/reveal";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Service Areas",
  description: "AGS air conditioning and refrigeration services across the UK, including London, Manchester, Birmingham, Leeds, Liverpool, Bristol, Glasgow and Edinburgh.",
  alternates: { canonical: "/service-areas" },
  openGraph: { url: "/service-areas", title: "Service Areas" },
};

export default async function ServiceAreasPage({
  searchParams,
}: PageProps<"/service-areas">) {
  const params = await searchParams;
  const postcodeParam = Array.isArray(params.postcode) ? params.postcode[0] : params.postcode;

  return (
    <div className="bg-white">
      <JsonLd
        id="ld-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Service Areas", path: "/service-areas" },
        ])}
      />
      <div className="border-b border-slate-200 bg-sky-50">
        <div className="container-ags py-4 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-700">Service Areas</span>
        </div>
      </div>

      <div className="container-ags py-12 lg:py-16">
        <Reveal className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Where We Work
          </h1>
          <p className="mt-3 text-slate-600">
            AGS provides air conditioning and refrigeration services across
            the UK, with engineers based near major cities for fast
            response times.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-10 max-w-2xl">
          <PostcodeChecker initialPostcode={postcodeParam} />
        </Reveal>

        <RevealStagger
          step={0.05}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {serviceAreas.map((area) => (
            <RevealItem
              key={area.city}
              variant="scale"
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <MapPinned className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy-900">{area.city}</p>
                <p className="text-xs text-slate-500">{area.region}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-slate-500">
          Don&apos;t see your area listed?{" "}
          <Link href="/contact" className="font-semibold text-brand-600 hover:text-brand-700">
            Get in touch
          </Link>{" "}
          — we&apos;re expanding our coverage and can often still help.
        </p>
      </div>
    </div>
  );
}
