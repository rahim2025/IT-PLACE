const mongoose = require("mongoose");

// Singleton document (there's only ever one) holding site-wide business
// info used for Organization/LocalBusiness structured data and as SEO
// fallback content across the site.
const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true, default: "ITPlace" },
    logo: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "Riyadh" },
    region: { type: String, trim: true, default: "Riyadh Region" },
    country: { type: String, trim: true, default: "Saudi Arabia" },
    countryCode: { type: String, trim: true, default: "SA" },
    postalCode: { type: String, trim: true, default: "" },
    serviceAreas: { type: [String], default: [] },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    googleMapsUrl: { type: String, trim: true, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    socialProfiles: {
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      youtube: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
