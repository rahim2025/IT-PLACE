// Central SEO configuration — every ID/URL here is env-driven so tracking
// and business identity can change without touching code. Vite only
// exposes env vars prefixed with VITE_ to client-side code.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://itplace.shop").replace(/\/$/, "");
export const SITE_NAME = "ITPlace";
export const DEFAULT_TITLE = "ITPlace — Network Infrastructure & ICT Solutions";
export const DEFAULT_DESCRIPTION =
  "ITPlace delivers enterprise networking, fiber infrastructure, cybersecurity, and surveillance solutions across Saudi Arabia.";
export const DEFAULT_OG_IMAGE = import.meta.env.VITE_OG_DEFAULT_IMAGE || "";
export const LOCALE = "en_SA";
export const HREFLANG = "en-SA";
export const TWITTER_SITE = import.meta.env.VITE_TWITTER_SITE || "";

// Analytics/verification — all opt-in via env vars; nothing renders until set.
export const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || "";
export const GTM_ID = import.meta.env.VITE_GTM_CONTAINER_ID || "";
export const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || "";
export const GSC_VERIFICATION = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || "";
export const BING_VERIFICATION = import.meta.env.VITE_BING_SITE_VERIFICATION || "";

// Uploaded product/category/brand images come back as absolute URLs from
// the backend already (it prepends its own PUBLIC_URL). Frontend-hosted
// static seed assets (e.g. /services/*.png) are relative — those need
// SITE_URL prepended for og:image/twitter:image, which require absolute URLs.
export function toAbsoluteUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export function absoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
