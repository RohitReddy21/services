import type { Thing, WithContext, Graph } from "schema-dts";

/**
 * Renders a JSON-LD structured-data block. Server component — the JSON is
 * serialized at render time and injected into the document head/body.
 */
export default function JsonLd({
  data,
  id,
}: {
  data: WithContext<Thing> | Graph;
  id?: string;
}) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // Structured data is trusted, build-time content — not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
