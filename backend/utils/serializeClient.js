function serializeClient(doc) {
  const c = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(c._id),
    name: c.name,
    location: c.location,
    work: c.work,
    order: c.order,
    status: c.status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

module.exports = { serializeClient };
