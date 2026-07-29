// One-time migration: generates slugs for any existing Product/Service
// documents that predate the slug field. Safe to re-run — only touches
// documents where slug is missing.
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Service = require("../models/Service");
const { generateUniqueSlug } = require("../utils/slugify");

async function backfill(Model, nameField, label) {
  const docs = await Model.find({ $or: [{ slug: { $exists: false } }, { slug: "" }] });
  let count = 0;
  for (const doc of docs) {
    doc.slug = await generateUniqueSlug(Model, doc[nameField], doc._id);
    await doc.save();
    count++;
  }
  console.log(`${label}: backfilled ${count} slug(s).`);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await backfill(Product, "name", "products");
    await backfill(Service, "title", "services");
    console.log("Done.");
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Backfill failed:", err.message);
    process.exit(1);
  });
