export interface ServiceArea {
  city: string;
  region: string;
  /** Outward-code prefixes used for the quick postcode checker (not exhaustive). */
  postcodePrefixes: string[];
}

export const serviceAreas: ServiceArea[] = [
  { city: "London", region: "Greater London", postcodePrefixes: ["E", "EC", "N", "NW", "SE", "SW", "W", "WC"] },
  { city: "Manchester", region: "North West", postcodePrefixes: ["M"] },
  { city: "Birmingham", region: "West Midlands", postcodePrefixes: ["B"] },
  { city: "Leeds", region: "Yorkshire", postcodePrefixes: ["LS"] },
  { city: "Liverpool", region: "North West", postcodePrefixes: ["L"] },
  { city: "Bristol", region: "South West", postcodePrefixes: ["BS"] },
  { city: "Sheffield", region: "Yorkshire", postcodePrefixes: ["S"] },
  { city: "Nottingham", region: "East Midlands", postcodePrefixes: ["NG"] },
  { city: "Leicester", region: "East Midlands", postcodePrefixes: ["LE"] },
  { city: "Coventry", region: "West Midlands", postcodePrefixes: ["CV"] },
  { city: "Glasgow", region: "Scotland", postcodePrefixes: ["G"] },
  { city: "Edinburgh", region: "Scotland", postcodePrefixes: ["EH"] },
];

/** Lightweight, non-exhaustive check against the outward code — a real
 * deployment would call a backend coverage lookup instead. */
export function checkPostcodeCoverage(postcode: string): ServiceArea | null {
  const outward = postcode.trim().toUpperCase().split(/\s+/)[0] ?? "";
  const letters = outward.match(/^[A-Z]+/)?.[0] ?? "";

  return (
    serviceAreas.find((area) =>
      area.postcodePrefixes.some((prefix) => letters === prefix)
    ) ?? null
  );
}
