const express = require("express");
const Product = require("../models/Product");
const { protect, restrictTo } = require("../middleware/auth");
const { slugify } = require("./slugify");

// Shared CRUD router builder for simple named/slugged taxonomies
// (Category, Brand). `countMatch(doc)` returns the Product filter used to
// count/guard products still referencing a given entity — categories are
// referenced by slug (Product.categoryId), brands by name (Product.brand).
function buildTaxonomyRouter(Model, { label, plural = `${label}s`, countMatch }) {
  const router = express.Router();

  async function uniqueSlug(name, excludeId) {
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

  function serialize(doc, productCounts) {
    return {
      id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
      status: doc.status,
      productCount: productCounts?.get(doc.slug) ?? productCounts?.get(doc.name) ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // GET / — public list, includes live product counts
  router.get("/", async (req, res) => {
    try {
      const docs = await Model.find().sort({ name: 1 });
      const groupField = label === "category" ? "$categoryId" : "$brand";
      const counts = await Product.aggregate([{ $group: { _id: groupField, count: { $sum: 1 } } }]);
      const countMap = new Map(counts.map((c) => [c._id, c.count]));
      res.json({ [plural]: docs.map((d) => serialize(d, countMap)) });
    } catch (err) {
      console.error(`Failed to list ${label}s:`, err.message);
      res.status(500).json({ error: `Could not load ${label}s.` });
    }
  });

  // GET /:id — public single
  router.get("/:id", async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: `${label} not found.` });
      const count = await Product.countDocuments(countMatch(doc));
      res.json({ [label]: serialize(doc, new Map([[doc.slug, count], [doc.name, count]])) });
    } catch {
      res.status(404).json({ error: `${label} not found.` });
    }
  });

  // POST / — admin only
  router.post("/", protect, restrictTo("admin"), async (req, res) => {
    const { name, status } = req.body ?? {};
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return res.status(400).json({ error: `${label} name is required.`, fieldErrors: { name: "This field is required." } });
    }
    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Status must be active or inactive." });
    }

    try {
      const existing = await Model.findOne({ name: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
      if (existing) {
        return res.status(409).json({
          error: `A ${label} with this name already exists.`,
          fieldErrors: { name: "This name is already in use." },
        });
      }

      const slug = await uniqueSlug(trimmedName);
      const doc = await Model.create({ name: trimmedName, slug, status: status || "active" });
      res.status(201).json({ [label]: serialize(doc, new Map()) });
    } catch (err) {
      console.error(`Failed to create ${label}:`, err.message);
      res.status(500).json({ error: `Could not create the ${label}. Please try again.` });
    }
  });

  // PUT /:id — admin only
  router.put("/:id", protect, restrictTo("admin"), async (req, res) => {
    const { name, status } = req.body ?? {};
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return res.status(400).json({ error: `${label} name is required.`, fieldErrors: { name: "This field is required." } });
    }
    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Status must be active or inactive." });
    }

    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: `${label} not found.` });

      const existing = await Model.findOne({
        _id: { $ne: doc._id },
        name: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
      if (existing) {
        return res.status(409).json({
          error: `A ${label} with this name already exists.`,
          fieldErrors: { name: "This name is already in use." },
        });
      }

      const previousSlug = doc.slug;
      const previousName = doc.name;
      if (trimmedName !== doc.name) {
        doc.slug = await uniqueSlug(trimmedName, doc._id);
      }
      doc.name = trimmedName;
      if (status) doc.status = status;
      await doc.save();

      // Keep denormalized product fields in sync so existing listings/filters
      // immediately reflect the rename without a separate migration step.
      if (label === "category" && doc.slug !== previousSlug) {
        await Product.updateMany({ categoryId: previousSlug }, { $set: { categoryId: doc.slug, category: doc.name } });
      } else if (label === "category") {
        await Product.updateMany({ categoryId: doc.slug }, { $set: { category: doc.name } });
      } else if (label === "brand" && doc.name !== previousName) {
        await Product.updateMany({ brand: previousName }, { $set: { brand: doc.name } });
      }

      res.json({ [label]: serialize(doc, new Map()) });
    } catch (err) {
      console.error(`Failed to update ${label}:`, err.message);
      res.status(500).json({ error: `Could not update the ${label}. Please try again.` });
    }
  });

  // DELETE /:id — admin only, blocked while products still reference it
  router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: `${label} not found.` });

      const productCount = await Product.countDocuments(countMatch(doc));
      if (productCount > 0) {
        return res.status(409).json({
          error: `This ${label} contains ${productCount} product${productCount === 1 ? "" : "s"}. Please move or delete those products before deleting this ${label}.`,
          productCount,
        });
      }

      await Model.findByIdAndDelete(doc._id);
      res.json({ ok: true });
    } catch (err) {
      console.error(`Failed to delete ${label}:`, err.message);
      res.status(500).json({ error: `Could not delete the ${label}. Please try again.` });
    }
  });

  return router;
}

module.exports = { buildTaxonomyRouter };
