import { emailLayout } from "../lib/email-layout";
import { env } from "../config/env";

export function welcomeEmail(name: string) {
  const subject = "Welcome to AGS";
  const html = emailLayout({
    preheader: "Your AGS account is ready.",
    heading: `Welcome, ${name.split(" ")[0]}`,
    bodyHtml: `<p>Thanks for creating an AGS account. You're all set to book air conditioning or refrigeration services, or subscribe to a recurring Care Plan.</p>`,
    ctaLabel: "Book a Service",
    ctaUrl: `${env.frontendUrl}/book`,
  });
  return { subject, html };
}
