const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, maxlength: 140 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);
