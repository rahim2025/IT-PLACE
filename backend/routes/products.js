const express = require("express");
const Product = require("../models/Product");
const { protect, restrictTo } = require("../middleware/auth");
const { upload, convertToWebp } = require("../middleware/upload");
const { serializeProduct } = require("../utils/serializeProduct");
const { parseListField, parseBool } = require("../utils/requestFields");
const { parseSeoFields } = require("../utils/seoFields");
const { generateUniqueSlug } = require("../utils/slugify");
const { formatMongooseValidationError } = require("../utils/mongooseErrors");

const router = express.Router();

const PAGE_SIZE_DEFAULT = 12;
const PAGE_SIZE_MAX = 60;

const SORT_STAGES = {
  "price-asc": { effectivePrice: 1 },
  "price-desc": { effectivePrice: -1 },
  "rating-desc": { rating: -1, reviewCount: -1 },
  az: { name: 1 },
  za: { name: -1 },
  newest: { newArrival: -1, rating: -1 },
  bestselling: { bestSeller: -1, reviewCount: -1 },
  popular: { reviewCount: -1 },
  featured: { featured: -1, rating: -1 },
};

function parseCsv(value) {
  return typeof value === "string" && value.length ? value.split(",").filter(Boolean) : [];
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Shared by the list and price-bounds routes: matches the active catalog,
// optionally narrowed by category/brand/search, and computes `effectivePrice`
// (the sale price when a valid discount is set, otherwise the regular price)
// plus `hasDiscount` — the same "current price" the storefront cards display,
// so filtering/sorting by price lines up with what shoppers actually see.
function buildBasePipeline(query) {
  const match = { status: "active" };

  const categoryIds = parseCsv(query.category);
  if (categoryIds.length) match.categoryId = { $in: categoryIds };

  const brands = parseCsv(query.brand);
  if (brands.length) match.brand = { $in: brands };

  const search = (query.q || "").trim();
  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    match.$or = [{ name: re }, { brand: re }, { category: re }, { tags: re }];
  }

  return [
    { $match: match },
    {
      $addFields: {
        hasDiscount: {
          $and: [{ $gt: ["$discountPrice", 0] }, { $lt: ["$discountPrice", "$price"] }],
        },
      },
    },
    { $addFields: { effectivePrice: { $cond: ["$hasDiscount", "$discountPrice", "$price"] } } },
  ];
}

function buildRefinementStage(query) {
  const conditions = [];

  const priceRange = {};
  if (query.minPrice !== undefined && query.minPrice !== "") priceRange.$gte = Number(query.minPrice);
  if (query.maxPrice !== undefined && query.maxPrice !== "") priceRange.$lte = Number(query.maxPrice);
  if (Object.keys(priceRange).length) conditions.push({ effectivePrice: priceRange });

  const rating = Number(query.rating);
  if (Number.isFinite(rating) && rating > 0) conditions.push({ rating: { $gte: rating } });

  for (const flag of parseCsv(query.availability)) {
    if (flag === "in-stock") conditions.push({ stock: { $gt: 0 } });
    else if (flag === "out-of-stock") conditions.push({ stock: { $lte: 0 } });
    else if (flag === "discounted") conditions.push({ hasDiscount: true });
    else if (flag === "new") conditions.push({ newArrival: true });
    else if (flag === "bestseller") conditions.push({ bestSeller: true });
  }

  return conditions.length ? [{ $match: { $and: conditions } }] : [];
}

function buildProductPayload(body, uploadedImageUrls) {
  const existingImages = parseListField(body.existingImages);
  const price = Number(body.price);
  const discountPrice = body.discountPrice === "" || body.discountPrice == null ? null : Number(body.discountPrice);
  const stock = Number(body.stock);
  const rating = body.rating === "" || body.rating == null ? 0 : Number(body.rating);
  const reviewCount = body.reviewCount === "" || body.reviewCount == null ? 0 : Number(body.reviewCount);

  const errors = {};
  if (!body.name?.trim()) errors.name = "Product name is required.";
  if (!body.categoryId?.trim()) errors.categoryId = "Category is required.";
  if (!body.brand?.trim()) errors.brand = "Brand is required.";
  if (!body.sku?.trim()) errors.sku = "SKU is required.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price.";
  if (discountPrice !== null && (!Number.isFinite(discountPrice) || discountPrice < 0)) {
    errors.discountPrice = "Enter a valid discount price.";
  }
  if (discountPrice !== null && Number.isFinite(price) && discountPrice >= price) {
    errors.discountPrice = "Discount price must be lower than the regular price.";
  }
  if (!Number.isFinite(stock) || stock < 0) errors.stock = "Enter a valid stock quantity.";
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) errors.rating = "Rating must be between 0 and 5.";
  if (!Number.isFinite(reviewCount) || reviewCount < 0) errors.reviewCount = "Enter a valid review count.";

  const images = [...existingImages, ...uploadedImageUrls].slice(0, 8);
  if (images.length === 0) errors.images = "Add at least one product image.";

  return {
    errors,
    payload: {
      name: body.name?.trim(),
      categoryId: body.categoryId?.trim(),
      category: body.category?.trim() || body.categoryId?.trim(),
      brand: body.brand?.trim(),
      price,
      discountPrice,
      sku: body.sku?.trim(),
      stock,
      images,
      description: body.description?.trim() || "",
      tags: parseListField(body.tags),
      colors: parseListField(body.colors),
      sizes: parseListField(body.sizes),
      featured: parseBool(body.featured),
      bestSeller: parseBool(body.bestSeller),
      newArrival: parseBool(body.newArrival),
      status: body.status === "draft" ? "draft" : "active",
      rating,
      reviewCount,
      ...parseSeoFields(body),
    },
  };
}

// GET /api/products — public, filtered + paginated (query: category, brand,
// q, minPrice, maxPrice, rating, availability, sort, page, pageSize)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(req.query.pageSize) || PAGE_SIZE_DEFAULT));
    const sort = SORT_STAGES[req.query.sort] || SORT_STAGES.featured;

    const pipeline = [...buildBasePipeline(req.query), ...buildRefinementStage(req.query)];

    const [countResult] = await Product.aggregate([...pipeline, { $count: "count" }]);
    const total = countResult?.count || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);

    const items = await Product.aggregate([
      ...pipeline,
      { $sort: sort },
      { $skip: (safePage - 1) * pageSize },
      { $limit: pageSize },
    ]);

    res.json({
      products: items.map(serializeProduct),
      total,
      totalPages,
      page: safePage,
      pageSize,
      startIndex: total === 0 ? 0 : (safePage - 1) * pageSize + 1,
      endIndex: Math.min(safePage * pageSize, total),
    });
  } catch (err) {
    console.error("Failed to list products:", err.message);
    res.status(500).json({ error: "Could not load products." });
  }
});

// GET /api/products/price-bounds — public, min/max current price across the
// active catalog (or a filtered subset), for the price-range slider
router.get("/price-bounds", async (req, res) => {
  try {
    const [result] = await Product.aggregate([
      ...buildBasePipeline(req.query),
      { $group: { _id: null, min: { $min: "$effectivePrice" }, max: { $max: "$effectivePrice" } } },
    ]);
    res.json({ min: result?.min ?? 0, max: result?.max ?? 0 });
  } catch (err) {
    console.error("Failed to load price bounds:", err.message);
    res.status(500).json({ error: "Could not load price bounds." });
  }
});

// GET /api/products/admin/all — admin only, the full catalog (active + draft,
// unpaginated) for the admin product table and dashboard, which do their own
// client-side search/filter/sort over everything rather than a server page
// at a time — unlike the storefront, admins need drafts visible too.
router.get("/admin/all", protect, restrictTo("admin"), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products: products.map(serializeProduct) });
  } catch (err) {
    console.error("Failed to list all products:", err.message);
    res.status(500).json({ error: "Could not load products." });
  }
});

// GET /api/products/slug/:slug — public, includes related products for
// detail-page internal linking (same category, excluding itself)
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: "active" });
    if (!product) return res.status(404).json({ error: "Product not found." });

    const related = await Product.find({
      categoryId: product.categoryId,
      status: "active",
      _id: { $ne: product._id },
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.json({ product: serializeProduct(product), related: related.map(serializeProduct) });
  } catch {
    res.status(404).json({ error: "Product not found." });
  }
});

// GET /api/products/:id — public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ product: serializeProduct(product) });
  } catch {
    res.status(404).json({ error: "Product not found." });
  }
});

// POST /api/products — admin only
router.post("/", protect, restrictTo("admin"), upload.array("images", 8), convertToWebp, async (req, res) => {
  const uploadedUrls = (req.files || []).map((f) => `/uploads/products/${f.filename}`);
  const { errors, payload } = buildProductPayload(req.body, uploadedUrls);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors: errors });
  }

  try {
    const existingSku = await Product.findOne({ sku: payload.sku });
    if (existingSku) {
      return res.status(409).json({ error: "A product with this SKU already exists.", fieldErrors: { sku: "SKU already in use." } });
    }
    payload.slug = await generateUniqueSlug(Product, payload.name);
    const product = await Product.create(payload);
    res.status(201).json({ product: serializeProduct(product) });
  } catch (err) {
    const validation = formatMongooseValidationError(err);
    if (validation) {
      return res.status(400).json(validation);
    }
    console.error("Failed to create product:", err.message);
    res.status(500).json({ error: "Could not create the product. Please try again." });
  }
});

// PUT /api/products/:id — admin only
router.put("/:id", protect, restrictTo("admin"), upload.array("images", 8), convertToWebp, async (req, res) => {
  const uploadedUrls = (req.files || []).map((f) => `/uploads/products/${f.filename}`);
  const { errors, payload } = buildProductPayload(req.body, uploadedUrls);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors: errors });
  }

  try {
    const duplicateSku = await Product.findOne({ sku: payload.sku, _id: { $ne: req.params.id } });
    if (duplicateSku) {
      return res.status(409).json({ error: "A product with this SKU already exists.", fieldErrors: { sku: "SKU already in use." } });
    }
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found." });
    if (!existing.slug || payload.name !== existing.name) {
      payload.slug = await generateUniqueSlug(Product, payload.name, existing._id);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    res.json({ product: serializeProduct(product) });
  } catch (err) {
    const validation = formatMongooseValidationError(err);
    if (validation) {
      return res.status(400).json(validation);
    }
    console.error("Failed to update product:", err.message);
    res.status(500).json({ error: "Could not update the product. Please try again." });
  }
});

// DELETE /api/products/:id — admin only
router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete product:", err.message);
    res.status(500).json({ error: "Could not delete the product. Please try again." });
  }
});

module.exports = router;
