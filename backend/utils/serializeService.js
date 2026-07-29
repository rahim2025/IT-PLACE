const { resolveMediaUrl } = require("./mediaUrl");

function serializeService(doc) {
  const s = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(s._id),
    title: s.title,
    summary: s.summary,
    image: resolveMediaUrl(s.image),
    icon: s.icon,
    productCategoryId: s.productCategoryId || null,
    order: s.order,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

module.exports = { serializeService };
