const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true},
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, maxlength: 220 },
    categoryId: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    sku: { type: String, required: true, trim: true, unique: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 8,
        message: "A product can have at most 8 images.",
      },
    },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "draft"], default: "active" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    // Optional SEO overrides — the frontend generates sensible defaults
    // from the fields above whenever these are left blank.
    seoTitle: { type: String, default: "", trim: true, maxlength: 70 },
    seoDescription: { type: String, default: "", trim: true, maxlength: 320 },
    seoKeywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: "", trim: true },
    ogImage: { type: String, default: "", trim: true },
    socialTitle: { type: String, default: "", trim: true, },
    socialDescription: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", category: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
