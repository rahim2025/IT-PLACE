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

// GET /api/products — public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products: products.map(serializeProduct) });
  } catch (err) {
    console.error("Failed to list products:", err.message);
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
