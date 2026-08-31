"use client";

import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { ANALYTICS } from "@/lib/site";

export const CONSENT_STORAGE_KEY = "ags-consent";

/**
 * Google Consent Mode v2 defaults — everything denied until the visitor
 * accepts, with a 500ms wait so tags queue rather than fire-and-lose. A prior
 * "granted" choice is re-applied immediately on load.
 */
const CONSENT_DEFAULT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
try {
  if (window.localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied' });
  }
} catch (e) {}
`;

/**
 * Loads GA4 / GTM only when their IDs are configured, so local and preview
 * builds never send data. Safe to render unconditionally.
 */
export default function Analytics() {
  const { gaId, gtmId } = ANALYTICS;
  if (!gaId && !gtmId) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }} />
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
