const { resolveMediaUrl } = require("./mediaUrl");

function serializeService(doc) {
  const s = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(s._id),
    title: s.title,
    slug: s.slug,
    summary: s.summary,
    image: resolveMediaUrl(s.image),
    icon: s.icon,
    productCategoryId: s.productCategoryId || null,
    order: s.order,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    seo: {
      title: s.seoTitle || "",
      description: s.seoDescription || "",
      keywords: s.seoKeywords || [],
      canonicalUrl: s.canonicalUrl || "",
      ogImage: s.ogImage ? resolveMediaUrl(s.ogImage) : "",
      socialTitle: s.socialTitle || "",
      socialDescription: s.socialDescription || "",
    },
  };
}

module.exports = { serializeService };
