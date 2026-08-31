/**
 * Single source of truth for site-wide identity used across metadata,
 * structured data, the sitemap, the web manifest and analytics.
 */

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const SITE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agsolutions.co.uk"
);

export const SITE_NAME = "AGS";
export const SITE_LEGAL_NAME = "Advanced Gas Solutions";
export const SITE_TAGLINE = "Advanced Air Conditioning & Refrigeration Solutions";

export const SITE_DESCRIPTION =
  "Professional air conditioning, refrigeration and electrical installation, servicing, maintenance and repair for commercial and residential customers across the UK. F-Gas certified engineers.";

export const ORG = {
  name: SITE_NAME,
  legalName: `${SITE_NAME} - ${SITE_LEGAL_NAME}`,
  telephone: "+44 20 7946 0018",
  telephoneHref: "tel:+442079460018",
  email: "info@agsolutions.co.uk",
  foundingDate: "2014",
  priceRange: "££",
  address: {
    street: "13 Baker Street",
    city: "London",
    region: "Greater London",
    postalCode: "W1U 3BW",
    country: "GB",
  },
  /** Approx. coordinates for 13 Baker Street, London. */
  geo: { latitude: 51.5169, longitude: -0.1573 },
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
