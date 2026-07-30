const express = require("express");
const fs = require("fs");
const path = require("path");
const Service = require("../models/Service");
const { protect, restrictTo } = require("../middleware/auth");
const { uploadService, convertToWebp } = require("../middleware/upload");
const { serializeService } = require("../utils/serializeService");
const { parseSeoFields } = require("../utils/seoFields");
const { generateUniqueSlug } = require("../utils/slugify");
const { formatMongooseValidationError } = require("../utils/mongooseErrors");

const router = express.Router();

function removeUploadedFile(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;
  fs.unlink(path.join(__dirname, "..", imagePath), () => {});
}

function buildServicePayload(body, uploadedImageUrl, existingImage) {
  const errors = {};
  if (!body.title?.trim()) errors.title = "Title is required.";
  if (!body.summary?.trim()) errors.summary = "Summary is required.";
  if (!body.icon?.trim()) errors.icon = "Please choose an icon.";

  const image = uploadedImageUrl || existingImage || null;
  if (!image) errors.image = "Add an image for this service.";

  const order = body.order === "" || body.order == null ? 0 : Number(body.order);
  if (!Number.isFinite(order)) errors.order = "Enter a valid display order.";

  return {
    errors,
    payload: {
      title: body.title?.trim(),
      summary: body.summary?.trim(),
      image,
      icon: body.icon?.trim(),
      productCategoryId: body.productCategoryId?.trim() || null,
      order,
      status: body.status === "inactive" ? "inactive" : "active",
      ...parseSeoFields(body),
    },
  };
}

// GET /api/services — public
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json({ services: services.map(serializeService) });
  } catch (err) {
    console.error("Failed to list services:", err.message);
    res.status(500).json({ error: "Could not load services." });
  }
});

// GET /api/services/slug/:slug — public, includes a few related services
router.get("/slug/:slug", async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, status: "active" });
    if (!service) return res.status(404).json({ error: "Service not found." });

    const related = await Service.find({ status: "active", _id: { $ne: service._id } })
      .sort({ order: 1 })
      .limit(3);

    res.json({ service: serializeService(service), related: related.map(serializeService) });
  } catch {
    res.status(404).json({ error: "Service not found." });
  }
});

// GET /api/services/:id — public
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found." });
    res.json({ service: serializeService(service) });
  } catch {
    res.status(404).json({ error: "Service not found." });
  }
});

// POST /api/services — admin only
router.post("/", protect, restrictTo("admin"), uploadService.single("image"), convertToWebp, async (req, res) => {
  const uploadedUrl = req.file ? `/uploads/services/${req.file.filename}` : null;
  const { errors, payload } = buildServicePayload(req.body, uploadedUrl, null);

  if (Object.keys(errors).length > 0) {
    if (uploadedUrl) removeUploadedFile(uploadedUrl);
    return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors: errors });
  }

  try {
    payload.slug = await generateUniqueSlug(Service, payload.title);
    const service = await Service.create(payload);
    res.status(201).json({ service: serializeService(service) });
  } catch (err) {
    const validation = formatMongooseValidationError(err);
    if (validation) {
      return res.status(400).json(validation);
    }
    console.error("Failed to create service:", err.message);
    res.status(500).json({ error: "Could not create the service. Please try again." });
  }
});

// PUT /api/services/:id — admin only
router.put("/:id", protect, restrictTo("admin"), uploadService.single("image"), convertToWebp, async (req, res) => {
  try {
    const existing = await Service.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Service not found." });

    const uploadedUrl = req.file ? `/uploads/services/${req.file.filename}` : null;
    const { errors, payload } = buildServicePayload(req.body, uploadedUrl, existing.image);

    if (Object.keys(errors).length > 0) {
      if (uploadedUrl) removeUploadedFile(uploadedUrl);
      return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors: errors });
    }

    if (uploadedUrl && existing.image !== uploadedUrl) {
      removeUploadedFile(existing.image);
    }
    if (!existing.slug || payload.title !== existing.title) {
      payload.slug = await generateUniqueSlug(Service, payload.title, existing._id);
    }

    Object.assign(existing, payload);
    await existing.save();
    res.json({ service: serializeService(existing) });
  } catch (err) {
    const validation = formatMongooseValidationError(err);
    if (validation) {
      return res.status(400).json(validation);
    }
    console.error("Failed to update service:", err.message);
    res.status(500).json({ error: "Could not update the service. Please try again." });
  }
});

// DELETE /api/services/:id — admin only
router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found." });

    removeUploadedFile(service.image);
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete service:", err.message);
    res.status(500).json({ error: "Could not delete the service. Please try again." });
  }
});

module.exports = router;
