import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { AuthProvider } from "@/components/auth/auth-context";
import AppShell from "@/components/layout/app-shell";
import SiteChrome from "@/components/layout/site-chrome";
import ChatWidget from "@/components/chat/chat-widget";
import JsonLd from "@/components/seo/json-ld";
import Analytics from "@/components/analytics/analytics";
import CookieConsent from "@/components/analytics/cookie-consent";
import { siteGraph } from "@/lib/seo";
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_LEGAL_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_LEGAL_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "AGS Air Conditioning & Refrigeration Ltd" }],
  creator: "AGS Air Conditioning & Refrigeration Ltd",
  publisher: "AGS Air Conditioning & Refrigeration Ltd",
  keywords: [
    "air conditioning",
    "refrigeration",
    "HVAC",
    "commercial refrigeration",
    "AC installation",
    "AC repair",
    "F-Gas certified",
    "cold room",
    "UK",
  ],
  category: "Home services",
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, address: true, email: true },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE_LEGAL_NAME,
    locale: "en_GB",
    url: SITE_URL,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d12" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-navy-900">
        <JsonLd id="ld-site" data={siteGraph()} />
        <Analytics />
        <AuthProvider>
          <SiteChrome>
            <Navbar />
          </SiteChrome>
          <main className="flex-1">
            <AppShell>{children}</AppShell>
          </main>
          <SiteChrome>
            <Footer />
            <ChatWidget />
          </SiteChrome>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
