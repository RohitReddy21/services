// Browser-side requests always go through this app's own origin (relative
// path) so that /api/* rewrites to the real backend (see next.config.ts) —
// this keeps auth cookies same-origin from the browser's point of view.
// The backend may live on a different domain in production, and cookies
// can never be visible across domains no matter how SameSite is set, so
// routing through our own origin is what makes login actually stick.
export const API_BASE_URL = "";
