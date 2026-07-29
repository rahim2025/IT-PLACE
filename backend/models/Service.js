const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, maxlength: 220 },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    image: { type: String, required: true },
    icon: { type: String, required: true, default: "Wrench" },
    productCategoryId: { type: String, default: null, trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    seoTitle: { type: String, default: "", trim: true, maxlength: 70 },
    seoDescription: { type: String, default: "", trim: true, maxlength: 320 },
    seoKeywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: "", trim: true },
    ogImage: { type: String, default: "", trim: true },
    socialTitle: { type: String, default: "", trim: true, maxlength: 70 },
    socialDescription: { type: String, default: "", trim: true, maxlength: 320 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
