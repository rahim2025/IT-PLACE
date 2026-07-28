// One-time/idempotent seed: mirrors the static client list that used to
// live in frontend/src/data/content.js.
require("dotenv").config();
const mongoose = require("mongoose");
const Client = require("../models/Client");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itplace";

const CLIENTS = [
  {
    name: "Dr. Sulaiman Al Habib Hospital",
    location: "Al Kharj",
    work: "Data center optical fiber fusion splicing, cable pulling & dressing, server rack installation, and UTP data point termination.",
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");

  let created = 0;
  let updated = 0;

  for (const [index, client] of CLIENTS.entries()) {
    const result = await Client.findOneAndUpdate(
      { name: client.name },
      { $set: { ...client, order: index, status: "active" } },
      { upsert: true, includeResultMetadata: true }
    );
    if (result.lastErrorObject?.updatedExisting) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`Seed complete: ${created} created, ${updated} updated, ${CLIENTS.length} total.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
