import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { AuthProvider } from "@/components/auth/auth-context";
import AppShell from "@/components/layout/app-shell";
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
  title: {
    default: "AGS | Advanced Air Conditioning & Refrigeration Solutions",
    template: "%s | AGS - Advanced Gas Solutions",
  },
  description:
    "Professional air conditioning and refrigeration installation, servicing, maintenance and repair for commercial and residential customers across the UK.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-navy-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            <AppShell>{children}</AppShell>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
