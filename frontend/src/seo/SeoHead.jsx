import { Helmet } from "react-helmet-async";
import {
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  LOCALE,
  HREFLANG,
  TWITTER_SITE,
  toAbsoluteUrl,
  absoluteUrl,
} from "./config";

// Client-side equivalent of server-side meta injection: this app is static
// hosting (no persistent Node process — see README note in server config),
// so per-page SEO tags are rendered client-side via react-helmet-async
// instead. Google/Bing both execute JS before indexing, so this still
// produces correct titles/OG/JSON-LD for search — the one tradeoff is
// non-JS crawlers and some link-preview bots won't see it, which is an
// acceptable cost against not needing a second Node.js application.
export default function SeoHead({
  title,
  description,
  keywords,
  canonical,
  robots = "index, follow",
  ogType = "website",
  ogImage,
  socialTitle,
  socialDescription,
  jsonLd = [],
}) {
  const finalTitle = title || DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalCanonical = canonical || absoluteUrl("/");
  const finalOgImage = toAbsoluteUrl(ogImage || DEFAULT_OG_IMAGE);
  const finalSocialTitle = socialTitle || finalTitle;
  const finalSocialDescription = socialDescription || finalDescription;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords?.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={finalCanonical} />
      <link rel="alternate" hrefLang={HREFLANG} href={finalCanonical} />
      <link rel="alternate" hrefLang="x-default" href={finalCanonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={LOCALE} />
      <meta property="og:title" content={finalSocialTitle} />
      <meta property="og:description" content={finalSocialDescription} />
      <meta property="og:url" content={finalCanonical} />
      {finalOgImage && <meta property="og:image" content={finalOgImage} />}

      <meta name="twitter:card" content={finalOgImage ? "summary_large_image" : "summary"} />
      {TWITTER_SITE && <meta name="twitter:site" content={TWITTER_SITE} />}
      <meta name="twitter:title" content={finalSocialTitle} />
      <meta name="twitter:description" content={finalSocialDescription} />
      {finalOgImage && <meta name="twitter:image" content={finalOgImage} />}

      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
