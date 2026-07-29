const express = require("express");
const Settings = require("../models/Settings");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

const TEXT_FIELDS = [
  "businessName",
  "logo",
  "description",
  "address",
  "city",
  "region",
  "country",
  "countryCode",
  "postalCode",
  "phone",
  "email",
  "whatsapp",
  "googleMapsUrl",
];

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
}

function serialize(doc) {
  return {
    businessName: doc.businessName,
    logo: doc.logo,
    description: doc.description,
    address: doc.address,
    city: doc.city,
    region: doc.region,
    country: doc.country,
    countryCode: doc.countryCode,
    postalCode: doc.postalCode,
    serviceAreas: doc.serviceAreas || [],
    phone: doc.phone,
    email: doc.email,
    whatsapp: doc.whatsapp,
    googleMapsUrl: doc.googleMapsUrl,
    latitude: doc.latitude,
    longitude: doc.longitude,
    socialProfiles: doc.socialProfiles || {},
    updatedAt: doc.updatedAt,
  };
}

// GET /api/settings — public (needed to build Organization/LocalBusiness
// schema and SEO fallbacks on every page)
router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ settings: serialize(settings) });
  } catch (err) {
    console.error("Failed to load settings:", err.message);
    res.status(500).json({ error: "Could not load settings." });
  }
});

// PUT /api/settings — admin only
router.put("/", protect, restrictTo("admin"), async (req, res) => {
  const body = req.body ?? {};
  try {
    const settings = await getOrCreateSettings();

    TEXT_FIELDS.forEach((field) => {
      if (body[field] !== undefined) settings[field] = String(body[field]).trim();
    });
    if (Array.isArray(body.serviceAreas)) {
      settings.serviceAreas = body.serviceAreas.map((a) => String(a).trim()).filter(Boolean);
    }
    if (body.socialProfiles && typeof body.socialProfiles === "object") {
      settings.socialProfiles = {
        ...(settings.socialProfiles?.toObject ? settings.socialProfiles.toObject() : settings.socialProfiles),
        ...body.socialProfiles,
      };
    }
    if (body.latitude !== undefined) settings.latitude = body.latitude === "" ? null : Number(body.latitude);
    if (body.longitude !== undefined) settings.longitude = body.longitude === "" ? null : Number(body.longitude);

    await settings.save();
    res.json({ settings: serialize(settings) });
  } catch (err) {
    console.error("Failed to update settings:", err.message);
    res.status(500).json({ error: "Could not update settings." });
  }
});

module.exports = router;
