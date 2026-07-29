const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, maxlength: 140 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    image: { type: String, default: "", trim: true },
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

module.exports = mongoose.model("Category", categorySchema);
