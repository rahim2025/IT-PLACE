// Shared shape for the optional SEO override fields across the Product/
// Category/Brand/Service admin forms (paired with SeoFieldsSection.jsx).
export const EMPTY_SEO_FIELDS = {
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  ogImage: "",
  socialTitle: "",
  socialDescription: "",
};

// Maps an entity's serialized `seo: {...}` object (from the backend) back
// into flat form-state fields for editing.
export function seoFieldsFromEntity(entity) {
  const seo = entity?.seo || {};
  return {
    seoTitle: seo.title || "",
    seoDescription: seo.description || "",
    seoKeywords: (seo.keywords || []).join(", "),
    canonicalUrl: seo.canonicalUrl || "",
    ogImage: seo.ogImage || "",
    socialTitle: seo.socialTitle || "",
    socialDescription: seo.socialDescription || "",
  };
}

// Trims form-state SEO fields down to the flat body fields the backend's
// parseSeoFields() expects (seoKeywords stays comma-separated — the
// backend accepts that as a fallback alongside JSON-array strings).
export function seoFieldsToPayload(form) {
  return {
    seoTitle: form.seoTitle.trim(),
    seoDescription: form.seoDescription.trim(),
    seoKeywords: form.seoKeywords.trim(),
    canonicalUrl: form.canonicalUrl.trim(),
    ogImage: form.ogImage.trim(),
    socialTitle: form.socialTitle.trim(),
    socialDescription: form.socialDescription.trim(),
  };
}
