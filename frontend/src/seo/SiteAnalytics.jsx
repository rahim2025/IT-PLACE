import { Helmet } from "react-helmet-async";
import { GA4_ID, GTM_ID, CLARITY_ID, GSC_VERIFICATION, BING_VERIFICATION } from "./config";

// Mounted once, sitewide (see App.jsx) — separate from each page's own
// SeoHead, since verification meta tags and analytics scripts belong on
// every page rather than being tied to per-page title/description state.
// Every tag here is opt-in via env var; nothing renders until the
// corresponding VITE_* variable is set, so this is safe to ship as-is with
// zero tracking active until IDs are configured.
export default function SiteAnalytics() {
  return (
    <Helmet>
      {GSC_VERIFICATION && <meta name="google-site-verification" content={GSC_VERIFICATION} />}
      {BING_VERIFICATION && <meta name="msvalidate.01" content={BING_VERIFICATION} />}

      {GTM_ID && (
        <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}</script>
      )}

      {GA4_ID && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}></script>
      )}
      {GA4_ID && (
        <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`}</script>
      )}

      {CLARITY_ID && (
        <script>{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}</script>
      )}
    </Helmet>
  );
}
