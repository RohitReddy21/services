"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/navigation/logo";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/social-icons";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Contact", href: "/contact" },
];

const acLinks = [
  { label: "Wall Mounted AC", href: "/services/air-conditioning/wall-mounted" },
  { label: "Cassette AC", href: "/services/air-conditioning/cassette" },
  { label: "VRV Systems", href: "/services/air-conditioning/vrv" },
  { label: "VRF Systems", href: "/services/air-conditioning/vrf" },
  { label: "All Air Conditioning", href: "/services?category=air-conditioning" },
];

const refrigerationLinks = [
  { label: "Cold Rooms", href: "/services/refrigeration/cold-rooms" },
  { label: "Walk-In Fridges", href: "/services/refrigeration/walk-in-fridges" },
  { label: "Ice Machines", href: "/services/refrigeration/ice-machines" },
  { label: "Blast Chillers", href: "/services/refrigeration/blast-chillers" },
  { label: "All Refrigeration", href: "/services?category=refrigeration" },
];

const electricalLinks = [
  { label: "Consumer Units", href: "/services/electrical/consumer-units" },
  { label: "EV Chargers", href: "/services/electrical/ev-chargers" },
  { label: "Rewiring", href: "/services/electrical/rewiring" },
  { label: "EICR & Testing", href: "/services/electrical/eicr-testing" },
  { label: "All Electrical", href: "/services?category=electrical" },
];

const helpLinks = [
  { label: "FAQ", href: "/help" },
  { label: "Support", href: "/account/support" },
  { label: "Booking Help", href: "/help?topic=Bookings" },
  { label: "Terms & Conditions", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-slate-300">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-300/70 to-transparent" />
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
      <motion.div
        className="container-ags grid grid-cols-2 gap-10 py-14 lg:grid-cols-7"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="col-span-2">
          <Logo variant="inverted" />
          <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
            Delivering professional air conditioning, refrigeration and
            electrical installation, servicing and repair solutions across the
            UK.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-100">
            <ShieldCheck className="size-3.5 text-accent-gold-400" />
            F-Gas certified engineering support
          </div>
          <div className="flex items-center gap-3 mt-5">
            {[
              { Icon: FacebookIcon, label: "AGS on Facebook" },
              { Icon: InstagramIcon, label: "AGS on Instagram" },
              { Icon: LinkedinIcon, label: "AGS on LinkedIn" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="ags-focus flex size-9 items-center justify-center rounded-lg bg-white/5 transition-all hover:-translate-y-0.5 hover:bg-brand-600"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Quick Links" links={quickLinks} />
        <FooterColumn title="Air Conditioning" links={acLinks} />
        <FooterColumn title="Refrigeration" links={refrigerationLinks} />
        <FooterColumn title="Electrical" links={electricalLinks} />
        <FooterColumn title="Help" links={helpLinks} />

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <Phone className="size-4 mt-0.5 shrink-0 text-brand-400" />
              <a href="tel:02079460018" className="hover:text-white">
                020 7946 0018
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="size-4 mt-0.5 shrink-0 text-brand-400" />
              <a href="mailto:info@agsolutions.co.uk" className="hover:text-white">
                info@agsolutions.co.uk
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="size-4 mt-0.5 shrink-0 text-brand-400" />
              <span>13 Baker Street, London, W1U 3BW</span>
            </li>
            <li className="pt-1 text-slate-500">Mon &ndash; Sat, 8:00 AM &ndash; 6:00 PM</li>
          </ul>
        </div>
      </motion.div>

      <div className="border-t border-white/10">
        <div className="container-ags py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Advanced Gas Solutions. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/legal/terms" className="hover:text-slate-300">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-slate-300">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="ags-focus text-slate-400 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
