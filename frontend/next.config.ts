import type { NextConfig } from "next";

// The backend lives on a different registrable domain in production
// (onrender.com vs vercel.app), so session cookies it sets can never be
// visible to this app's own origin no matter how SameSite is configured —
// cookies are scoped to the domain that set them, full stop. Proxying /api/*
// through this app's own origin means the browser only ever talks to this
// site, so cookies set via that response are stored as same-origin and both
// client-side fetches and server-side rendering can see the session.
const backendUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    // Source images are WebP; serve AVIF to browsers that take it (typically
    // another 20-30% smaller) and fall back to WebP everywhere else.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Pull only the used symbols out of these large packages instead of their
  // barrel files, which meaningfully trims the client bundle (drei in
  // particular pulls in a lot transitively).
  experimental: {
    optimizePackageImports: [
      "@react-three/drei",
      "@react-three/fiber",
      "framer-motion",
      "lucide-react",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
