import { SITE_URL, SITE_NAME, toAbsoluteUrl, absoluteUrl } from "./config";

export function buildOrganizationSchema(settings) {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: settings?.businessName || SITE_NAME,
    url: SITE_URL,
  };
  if (settings?.logo) org.logo = toAbsoluteUrl(settings.logo);
  if (settings?.description) org.description = settings.description;

  const sameAs = Object.values(settings?.socialProfiles || {}).filter(Boolean);
  if (sameAs.length) org.sameAs = sameAs;

  if (settings?.phone || settings?.email) {
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "SA",
      availableLanguage: ["en"],
      ...(settings.phone ? { telephone: settings.phone } : {}),
      ...(settings.email ? { email: settings.email } : {}),
    };
  }

  if (settings?.address || settings?.city) {
    org.address = {
      "@type": "PostalAddress",
      ...(settings.address ? { streetAddress: settings.address } : {}),
      addressLocality: settings.city || "Riyadh",
      addressRegion: settings.region || "Riyadh Region",
      ...(settings.postalCode ? { postalCode: settings.postalCode } : {}),
      addressCountry: settings.countryCode || "SA",
    };
  }

  if (settings?.latitude != null && settings?.longitude != null) {
    org.geo = { "@type": "GeoCoordinates", latitude: settings.latitude, longitude: settings.longitude };
  }

  return org;
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/products?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

// items: [{ name, url }] top-level down to the current page. Home prepended.
export function buildBreadcrumbSchema(items) {
  const list = [{ name: "Home", url: SITE_URL }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductSchema(product) {
  const images = product.images?.length
    ? product.images.map(toAbsoluteUrl)
    : product.image
    ? [toAbsoluteUrl(product.image)]
    : undefined;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description || `${product.name} by ${product.brand}, available at ${SITE_NAME}.`,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    ...(images ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "SAR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (product.rating > 0 && product.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }
  return schema;
}

export function buildCollectionPageSchema({ name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    ...(description ? { description } : {}),
    url,
  };
}

export function buildServiceSchema(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: "SA",
    ...(service.image ? { image: toAbsoluteUrl(service.image) } : {}),
    url: absoluteUrl(`/services/${service.slug}`),
  };
}

// Reusable but unwired today — no FAQ content/page exists yet. Ready for
// whenever a future FAQ page is built: pass [{ question, answer }].
export function buildFaqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
