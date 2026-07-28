// One-time/idempotent seed: creates Category/Brand documents matching the
// categoryId/brand strings already used by the seeded product catalog, so
// the admin Category/Brand Management pages aren't empty and product counts
// line up with existing data.
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Product = require("../models/Product");
const { slugify } = require("../utils/slugify");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itplace";

const CATEGORY_NAMES = {
  networking: "Networking Equipment",
  servers: "Servers & Storage",
  cabling: "Structured Cabling",
  fiber: "Fiber Optic Products",
  surveillance: "Surveillance & Security",
  power: "Power & Backup",
  racks: "Racks & Enclosures",
  wireless: "Wireless Solutions",
  tools: "Tools & Testing",
  voip: "Business Communication",
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");

  let categoriesCreated = 0;
  for (const [slug, name] of Object.entries(CATEGORY_NAMES)) {
    const result = await Category.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name, slug, status: "active" } },
      { upsert: true, includeResultMetadata: true }
    );
    if (!result.lastErrorObject?.updatedExisting) categoriesCreated += 1;
  }

  const brandNames = await Product.distinct("brand");
  let brandsCreated = 0;
  for (const name of brandNames) {
    if (!name) continue;
    const slug = slugify(name);
    const result = await Brand.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, slug, status: "active" } },
      { upsert: true, includeResultMetadata: true }
    );
    if (!result.lastErrorObject?.updatedExisting) brandsCreated += 1;
  }

  console.log(`Seed complete: ${categoriesCreated} categories created, ${brandsCreated} brands created.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
