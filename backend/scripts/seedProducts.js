// One-time/idempotent seed: mirrors the mock catalog that used to live in
// frontend/vite-project/src/data/products.js so the storefront looks
// identical once it switches from the static import to a real API call.
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itplace";

const CATEGORIES = [
  { id: "networking", name: "Networking Equipment", image: "/services/01-network-design.png" },
  { id: "servers", name: "Servers & Storage", image: "/services/06-enterprise-computing-storage.png" },
  { id: "cabling", name: "Structured Cabling", image: "/services/20-structured-connectivity.png" },
  { id: "fiber", name: "Fiber Optic Products", image: "/services/03-fiber-connectivity.png" },
  { id: "surveillance", name: "Surveillance & Security", image: "/services/09-security-surveillance.png" },
  { id: "power", name: "Power & Backup", image: "/services/14-power-backup.png" },
  { id: "racks", name: "Racks & Enclosures", image: "/services/12-enclosures-racks.png" },
  { id: "wireless", name: "Wireless Solutions", image: "/services/08-wireless-connectivity.png" },
  { id: "tools", name: "Tools & Testing", image: "/services/16-network-testing-tools.png" },
  { id: "voip", name: "Business Communication", image: "/services/10-business-communication.png" },
];

const CATEGORY_BRANDS = {
  networking: ["Cisco", "Ubiquiti", "TP-Link", "MikroTik", "Netgear", "D-Link"],
  servers: ["Dell", "HPE", "Synology", "Lenovo"],
  cabling: ["Panduit", "Corning", "Legrand"],
  fiber: ["Corning", "Fiberdyne", "CommScope"],
  surveillance: ["Hikvision", "Dahua", "Axis"],
  power: ["APC", "Eaton", "Vertiv"],
  racks: ["Panduit", "Legrand", "APC"],
  wireless: ["Ubiquiti", "Cisco", "TP-Link", "Aruba"],
  tools: ["Fluke Networks", "NetAlly", "TP-Link"],
  voip: ["Yealink", "Cisco", "Grandstream"],
};

const TEMPLATES = {
  networking: [
    { name: "24-Port Gigabit Managed Switch", price: 320, tags: ["switch", "gigabit", "managed"], colors: ["Black"] },
    { name: "48-Port PoE+ Managed Switch", price: 640, tags: ["switch", "poe", "managed"], colors: ["Black"] },
    { name: "8-Port Unmanaged Desktop Switch", price: 45, tags: ["switch", "unmanaged", "compact"], colors: ["Black", "White"] },
    { name: "Dual-WAN Gigabit VPN Router", price: 280, tags: ["router", "vpn", "dual-wan"] },
    { name: "Enterprise Firewall Appliance", price: 950, tags: ["firewall", "security", "enterprise"] },
    { name: "10G SFP+ Aggregation Switch", price: 1200, tags: ["switch", "10g", "sfp+"] },
    { name: "Layer 3 Core Switch", price: 2100, tags: ["switch", "layer3", "core", "bestseller-candidate"] },
  ],
  servers: [
    { name: "2U Rack-Mount Server, Dual CPU", price: 3800, tags: ["server", "rack-mount", "enterprise"] },
    { name: "Tower Server, Entry-Level", price: 1450, tags: ["server", "tower", "sme"] },
    { name: "4-Bay NAS Storage Appliance", price: 620, tags: ["storage", "nas", "backup"] },
    { name: "8-Bay NAS Storage Appliance", price: 1350, tags: ["storage", "nas", "backup"] },
    { name: "1U High-Density Rack Server", price: 2600, tags: ["server", "rack-mount", "high-density"] },
    { name: "All-Flash Storage Array", price: 5400, tags: ["storage", "flash", "enterprise"] },
    { name: "Blade Server Chassis", price: 7200, tags: ["server", "blade", "enterprise"] },
  ],
  cabling: [
    { name: "Cat6A U/UTP Cable, 305m Box", price: 210, tags: ["cable", "cat6a", "copper"], sizes: ["305m"] },
    { name: "Cat6 U/UTP Cable, 305m Box", price: 150, tags: ["cable", "cat6", "copper"], sizes: ["305m"] },
    { name: "24-Port Cat6 Patch Panel", price: 65, tags: ["patch-panel", "cat6"] },
    { name: "48-Port Cat6A Patch Panel", price: 140, tags: ["patch-panel", "cat6a"] },
    { name: "RJ45 Keystone Jack (Pack of 10)", price: 22, tags: ["keystone", "connector"] },
    { name: "Cat6 Patch Cord", price: 5, tags: ["patch-cord", "cat6"], sizes: ["0.5m", "1m", "2m", "3m"] },
    { name: "Cable Management Trunking, 2m", price: 18, tags: ["cable-management", "trunking"], sizes: ["2m"] },
  ],
  fiber: [
    { name: "Single-Mode Fiber Patch Cord, LC-LC", price: 12, tags: ["fiber", "single-mode", "patch-cord"], sizes: ["1m", "3m", "5m", "10m"] },
    { name: "Multi-Mode Fiber Patch Cord, LC-LC", price: 10, tags: ["fiber", "multi-mode", "patch-cord"], sizes: ["1m", "3m", "5m"] },
    { name: "24-Core Single-Mode Fiber Cable, 1km", price: 480, tags: ["fiber", "outdoor", "single-mode"] },
    { name: "1U Fiber Optic Distribution Frame (ODF)", price: 95, tags: ["odf", "fiber", "rack-mount"] },
    { name: "SFP+ 10G Transceiver Module", price: 38, tags: ["transceiver", "sfp+", "10g"] },
    { name: "Fiber Fast Connector, LC (Pack of 10)", price: 55, tags: ["connector", "fiber", "lc"] },
    { name: "Fiber Splice Closure, 24-Core", price: 72, tags: ["splice-closure", "outdoor", "fiber"] },
  ],
  surveillance: [
    { name: "4MP IP Dome Camera", price: 85, tags: ["camera", "ip", "dome"], colors: ["White", "Black"] },
    { name: "4MP IP Bullet Camera", price: 78, tags: ["camera", "ip", "bullet", "outdoor"], colors: ["White"] },
    { name: "8-Channel PoE NVR", price: 210, tags: ["nvr", "poe", "recorder"] },
    { name: "16-Channel PoE NVR", price: 340, tags: ["nvr", "poe", "recorder"] },
    { name: "PTZ Speed Dome Camera", price: 620, tags: ["camera", "ptz", "outdoor"] },
    { name: "4K Ultra HD IP Camera", price: 165, tags: ["camera", "4k", "ip"], colors: ["White", "Black"] },
    { name: "Video Surveillance Software License", price: 45, tags: ["software", "vms", "license"] },
  ],
  power: [
    { name: "1kVA Line-Interactive UPS", price: 145, tags: ["ups", "backup-power"] },
    { name: "3kVA Online Double-Conversion UPS", price: 780, tags: ["ups", "backup-power", "enterprise"] },
    { name: "6kVA Rack-Mount UPS", price: 1650, tags: ["ups", "rack-mount", "enterprise"] },
    { name: "8-Outlet Rack PDU", price: 95, tags: ["pdu", "rack-mount"] },
    { name: "24-Outlet Metered Rack PDU", price: 320, tags: ["pdu", "rack-mount", "metered"] },
    { name: "Replacement UPS Battery Pack", price: 60, tags: ["battery", "ups", "replacement"] },
    { name: "Surge Protection Device", price: 40, tags: ["surge-protector"] },
  ],
  racks: [
    { name: "12U Wall-Mount Cabinet", price: 180, tags: ["rack", "wall-mount"], sizes: ["12U"] },
    { name: "24U Wall-Mount Cabinet", price: 290, tags: ["rack", "wall-mount"], sizes: ["24U"] },
    { name: "42U Floor-Standing Server Rack", price: 620, tags: ["rack", "floor-standing"], sizes: ["42U"] },
    { name: "IP55 Outdoor Rack Enclosure", price: 890, tags: ["rack", "outdoor", "ip55"] },
    { name: "Rack Cooling Fan Panel", price: 75, tags: ["cooling", "rack-accessory"] },
    { name: "Vertical Cable Manager", price: 55, tags: ["cable-management", "rack-accessory"] },
    { name: "Rack Shelf, Fixed 1U", price: 25, tags: ["rack-accessory", "shelf"] },
  ],
  wireless: [
    { name: "Wi-Fi 6 Indoor Access Point", price: 165, tags: ["access-point", "wifi6", "indoor"], colors: ["White"] },
    { name: "Wi-Fi 6E Outdoor Access Point", price: 240, tags: ["access-point", "wifi6e", "outdoor"] },
    { name: "Long-Range Point-to-Point Bridge", price: 310, tags: ["bridge", "outdoor", "long-range"] },
    { name: "Wireless Controller Appliance", price: 520, tags: ["controller", "wireless"] },
    { name: "In-Wall Wi-Fi Access Point", price: 130, tags: ["access-point", "in-wall"], colors: ["White"] },
    { name: "Mesh Wi-Fi System (3-Pack)", price: 220, tags: ["mesh", "wifi", "home"], colors: ["White", "Black"] },
    { name: "Outdoor Wireless CPE", price: 95, tags: ["cpe", "outdoor", "wireless"] },
  ],
  tools: [
    { name: "Cable Certification Tester", price: 4200, tags: ["tester", "certification"] },
    { name: "OTDR Fiber Tester", price: 3600, tags: ["otdr", "fiber", "tester"] },
    { name: "Optical Power Meter", price: 210, tags: ["power-meter", "fiber"] },
    { name: "Fusion Splicer", price: 2800, tags: ["splicer", "fiber"] },
    { name: "Network Cable Crimping Tool Kit", price: 45, tags: ["crimping-tool", "hand-tool"] },
    { name: "Cable Toner & Tracer Kit", price: 65, tags: ["toner", "tracer"] },
    { name: "PoE Tester", price: 55, tags: ["poe", "tester"] },
  ],
  voip: [
    { name: "Entry-Level IP Desk Phone", price: 55, tags: ["ip-phone", "voip"], colors: ["Black", "White"] },
    { name: "Executive IP Desk Phone", price: 130, tags: ["ip-phone", "voip", "executive"] },
    { name: "Cordless DECT IP Phone", price: 95, tags: ["ip-phone", "cordless", "dect"] },
    { name: "SIP Video Conferencing Phone", price: 340, tags: ["video-conferencing", "sip"] },
    { name: "Analog Telephone Adapter (ATA)", price: 40, tags: ["ata", "voip"] },
    { name: "IP PBX Appliance", price: 780, tags: ["pbx", "voip", "enterprise"] },
    { name: "USB Conference Speakerphone", price: 165, tags: ["conferencing", "speakerphone"] },
  ],
};

function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildProducts() {
  const products = [];
  let counter = 0;

  CATEGORIES.forEach((category) => {
    const brands = CATEGORY_BRANDS[category.id];
    const templates = TEMPLATES[category.id];

    templates.forEach((template, i) => {
      counter += 1;
      const brand = brands[i % brands.length];
      const r1 = pseudoRandom(counter * 12.9898);
      const r2 = pseudoRandom(counter * 78.233);
      const r3 = pseudoRandom(counter * 37.719);

      const rating = Math.round((3.5 + r1 * 1.5) * 10) / 10;
      const reviewCount = Math.floor(8 + r2 * 240);
      const stock = r3 < 0.12 ? 0 : Math.floor(3 + r2 * 80);
      const hasDiscount = r1 < 0.22;
      const isNew = r2 > 0.82;
      const isBestSeller = r3 > 0.85 || template.tags.includes("bestseller-candidate");
      const isFeatured = counter % 9 === 0;

      // Mock data used price=display price, compareAtPrice=higher original.
      // The backend schema is the other way round: price=regular, discountPrice=sale.
      const regularPrice = hasDiscount ? Math.round(template.price * 1.2 * 100) / 100 : template.price;
      const discountPrice = hasDiscount ? template.price : null;

      products.push({
        sku: `ITP-${category.id.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
        name: template.name,
        category: category.name,
        categoryId: category.id,
        brand,
        price: regularPrice,
        discountPrice,
        rating,
        reviewCount,
        stock,
        images: [category.image],
        description: `${brand} ${template.name.toLowerCase()} — sourced and supported by ITPlace for commercial and enterprise deployments.`,
        tags: template.tags,
        colors: template.colors || [],
        sizes: template.sizes || [],
        newArrival: isNew,
        bestSeller: isBestSeller,
        featured: isFeatured,
        status: "active",
      });
    });
  });

  return products;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");

  const products = buildProducts();
  let created = 0;
  let updated = 0;

  for (const product of products) {
    const result = await Product.findOneAndUpdate(
      { sku: product.sku },
      { $set: product },
      { upsert: true, includeResultMetadata: true }
    );
    if (result.lastErrorObject?.updatedExisting) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`Seed complete: ${created} created, ${updated} updated, ${products.length} total.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
