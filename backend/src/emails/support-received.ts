import { emailLayout } from "../lib/email-layout";

export function supportReceivedEmail(subjectLine: string) {
  const subject = "We've received your message";
  const html = emailLayout({
    preheader: "AGS support has received your enquiry.",
    heading: "We've Got Your Message",
    bodyHtml: `
      <p>Thanks for reaching out to AGS. We've received your message and our team will get back to you shortly.</p>
      <p style="margin-top:12px;color:#64748b;font-size:13px;"><em>&ldquo;${subjectLine}&rdquo;</em></p>
    `,
  });
  return { subject, html };
}
