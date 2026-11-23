/**
 * Single source of truth for site-wide identity used across metadata,
 * structured data, the sitemap, the web manifest and analytics.
 */

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const SITE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://agsrefrigeration.uk"
);

export const SITE_NAME = "AGS";
export const SITE_LEGAL_NAME = "AGS Air Conditioning & Refrigeration Ltd";
export const SITE_TAGLINE = "Advanced Air Conditioning & Refrigeration Solutions";

export const SITE_DESCRIPTION =
  "Professional air conditioning and refrigeration installation, servicing, maintenance and repair for commercial and residential customers across the UK. F-Gas certified engineers.";

export const ORG = {
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  /** Primary number, international format (used in structured data). */
  telephone: "+44 7904 858877",
  telephoneHref: "tel:+447904858877",
  /** All public numbers, in the order they should be shown. */
  phones: [
    { display: "07904 858877", href: "tel:+447904858877" },
    { display: "07904 858881", href: "tel:+447904858881" },
  ],
  email: "support@agsrefrigeration.uk",
  foundingDate: "2014",
  priceRange: "££",
  address: {
    street: "79 Cameron Street",
    city: "Liverpool",
    region: "Merseyside",
    postalCode: "L7 0EN",
    country: "GB",
  },
  /** One-line address for display. */
  addressLine: "79 Cameron Street, Liverpool, L7 0EN",
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "08:00", closes: "18:00" },
  ],
  /** Add real profile URLs here to emit schema.org sameAs links. */
  socials: [] as string[],
} as const;

/** Absolute URL builder — always returns a fully-qualified https URL. */
export function absoluteUrl(path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean === "/" ? "" : stripTrailingSlash(clean)}`;
}

export const ANALYTICS = {
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
};

export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";
