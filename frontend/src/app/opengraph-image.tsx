import { ImageResponse } from "next/og";
import { SITE_LEGAL_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_LEGAL_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #071224 0%, #0b1b33 45%, #142f6b 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "9999px",
              background: "#ffffff",
              color: "#0b1b33",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            AGS
          </div>
          <div
            style={{
              fontSize: "20px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8ab5ff",
              fontWeight: 600,
            }}
          >
            Advanced Gas Solutions
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: "88px", height: "6px", background: "#cf9f3d", borderRadius: "3px" }} />
          <div
            style={{
              marginTop: "28px",
              fontSize: "68px",
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#ffffff",
              maxWidth: "900px",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div style={{ marginTop: "24px", fontSize: "28px", color: "#dce9ff", maxWidth: "820px" }}>
            F&#8209;Gas certified engineers · Installation · Servicing · Repairs · UK-wide
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
