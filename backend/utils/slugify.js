function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Shared by any model with a unique `slug` field (Category, Brand, Product,
// Service): slugifies `name`, then appends -2, -3, ... until unused.
async function generateUniqueSlug(Model, name, excludeId) {
  const base = slugify(name) || "item";
  let candidate = base;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Model.findOne({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

module.exports = { slugify, generateUniqueSlug };
