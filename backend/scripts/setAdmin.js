// Dev utility: promote an existing user to admin by email.
// Usage: node scripts/setAdmin.js someone@example.com
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itplace";
const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/setAdmin.js <email>");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { role: "admin" },
    { returnDocument: "after" }
  );

  if (!user) {
    console.error(`No user found with email ${email}`);
  } else {
    console.log(`${user.email} is now an admin.`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Failed to set admin:", err);
  process.exit(1);
});
