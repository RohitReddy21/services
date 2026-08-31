import type {
  BreadcrumbList,
  FAQPage,
  Graph,
  LocalBusiness,
  Organization,
  Service,
  WebPage,
  WebSite,
  WithContext,
} from "schema-dts";
import { ORG, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOCALBUSINESS_ID = `${SITE_URL}/#localbusiness`;

const postalAddress = {
  "@type": "PostalAddress" as const,
  streetAddress: ORG.address.street,
  addressLocality: ORG.address.city,
  addressRegion: ORG.address.region,
  postalCode: ORG.address.postalCode,
  addressCountry: ORG.address.country,
};

/** Organization + WebSite + LocalBusiness graph — rendered once, site-wide. */
export function siteGraph(): Graph {
  const organization: Organization = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: ORG.legalName,
    url: SITE_URL,
    email: ORG.email,
    telephone: ORG.telephone,
    foundingDate: ORG.foundingDate,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/opengraph-image"),
    },
    address: postalAddress,
    ...(ORG.socials.length ? { sameAs: ORG.socials } : {}),
  };

  const website: WebSite = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-GB",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/services?q={search_term_string}`,
      },
      // schema-dts types query-input loosely; the string form is what Google expects.
      "query-input": "required name=search_term_string",
    } as WebSite["potentialAction"],
  };

  const localBusiness: LocalBusiness = {
    "@type": "HVACBusiness",
    "@id": LOCALBUSINESS_ID,
    name: ORG.legalName,
    image: absoluteUrl("/opengraph-image"),
    url: SITE_URL,
    telephone: ORG.telephone,
    email: ORG.email,
    priceRange: ORG.priceRange,
    address: postalAddress,
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORG.geo.latitude,
      longitude: ORG.geo.longitude,
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    parentOrganization: { "@id": ORG_ID },
    openingHoursSpecification: ORG.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, localBusiness],
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  category: string;
  image?: string;
}): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: input.category,
    url: absoluteUrl(input.path),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    provider: { "@id": LOCALBUSINESS_ID },
    areaServed: { "@type": "Country", name: "United Kingdom" },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function webPageSchema(input: {
  name: string;
  description: string;
  path: string;
  type?: WebPage["@type"];
}): WithContext<WebPage> {
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en-GB",
  };
}
