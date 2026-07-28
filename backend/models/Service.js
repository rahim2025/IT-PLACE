const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    image: { type: String, required: true },
    icon: { type: String, required: true, default: "Wrench" },
    productCategoryId: { type: String, default: null, trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
