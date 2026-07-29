// Mirrors backend/utils/slugify.js exactly — used client-side only to build
// internal links to /brands/:slug from a product's plain-text `brand` name
// (Product doesn't store a brand slug/ref, just the name).
export function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
