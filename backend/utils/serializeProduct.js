const { resolveMediaUrl } = require("./mediaUrl");

// Adapts the backend Product document (spec'd field names: images[], discountPrice,
// featured, bestSeller, newArrival, status) to the shape the existing storefront
// components already expect (image, compareAtPrice, isFeatured, isBestSeller, isNew,
// inStock) so the frontend filtering/sorting/card code needs zero changes.
function serializeProduct(doc) {
  const p = doc.toObject ? doc.toObject() : doc;
  // Spec's schema stores price = regular price, discountPrice = sale price
  // (lower, optional). The storefront card expects the opposite framing:
  // `price` is the bold "current" price and `compareAtPrice` is the
  // struck-through original — so when a discount is active we swap them.
  const hasDiscount = typeof p.discountPrice === "number" && p.discountPrice > 0 && p.discountPrice < p.price;

  return {
    id: String(p._id),
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    category: p.category,
    categoryId: p.categoryId,
    brand: p.brand,
    price: hasDiscount ? p.discountPrice : p.price,
    compareAtPrice: hasDiscount ? p.price : null,
    regularPrice: p.price,
    discountPrice: p.discountPrice ?? null,
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    stock: p.stock,
    inStock: p.stock > 0,
    image: p.images?.[0] ? resolveMediaUrl(p.images[0]) : null,
    images: (p.images || []).map(resolveMediaUrl),
    description: p.description || "",
    tags: p.tags || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    isNew: Boolean(p.newArrival),
    isBestSeller: Boolean(p.bestSeller),
    isFeatured: Boolean(p.featured),
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    seo: {
      title: p.seoTitle || "",
      description: p.seoDescription || "",
      keywords: p.seoKeywords || [],
      canonicalUrl: p.canonicalUrl || "",
      ogImage: p.ogImage ? resolveMediaUrl(p.ogImage) : "",
      socialTitle: p.socialTitle || "",
      socialDescription: p.socialDescription || "",
    },
  };
}

module.exports = { serializeProduct };
