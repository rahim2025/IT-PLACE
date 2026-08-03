// One-time/idempotent seed: mirrors the static service list that used to
// live in frontend/src/data/content.js so the homepage looks
// identical once the Services carousel switches to a real API call.
require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("../models/Service");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itplace";

const SERVICES = [
  {
    title: "Network Design, Deployment & Integration",
    summary:
      "End-to-end networking solutions with scalable LAN, WAN, and wireless design, enterprise-grade deployment, and secure configuration.",
    image: "/services/01-network-design.webp",
    icon: "Network",
    productCategoryId: "networking",
  },
  {
    title: "Managed Network Operations & Technical Support",
    summary:
      "Proactive monitoring, preventive maintenance, backup and disaster recovery, and rapid technical support to maximize uptime.",
    image: "/services/02-managed-network-ops.webp",
    icon: "Headset",
    productCategoryId: "networking",
  },
  {
    title: "Fiber Connectivity Solutions",
    summary:
      "Ultra-fast, high-capacity fiber optic networks with professional supply and installation of cables, ODFs, and patch panels.",
    image: "/services/03-fiber-connectivity.webp",
    icon: "Cable",
    productCategoryId: "fiber",
  },
  {
    title: "Fiber Integration & Splicing Services",
    summary:
      "Precise fusion splicing, termination, emergency restoration, OTDR testing, and fault diagnosis for optimal fiber performance.",
    image: "/services/04-fiber-splicing.webp",
    icon: "Zap",
    productCategoryId: "fiber",
  },
  {
    title: "Mission-Critical Infrastructure",
    summary:
      "Reliable server room and data center infrastructure — rack deployment, structured cabling, cooling, and power distribution.",
    image: "/services/05-mission-critical-infra.webp",
    icon: "Server",
    productCategoryId: "racks",
  },
  {
    title: "Enterprise Computing & Storage",
    summary:
      "Robust platforms for virtualization, backup, and centralized data management with reliable, scalable server and storage systems.",
    image: "/services/06-enterprise-computing-storage.webp",
    icon: "Database",
    productCategoryId: "servers",
  },
  {
    title: "Digital Security & Protection",
    summary:
      "Firewalls, VPNs, access control, network segmentation, and endpoint protection for a secure, resilient IT environment.",
    image: "/services/07-digital-security.webp",
    icon: "ShieldCheck",
    productCategoryId: "networking",
  },
  {
    title: "Wireless Connectivity Solutions",
    summary:
      "Enterprise wireless networks delivering seamless, secure, high-speed access across offices, hotels, and campuses.",
    image: "/services/08-wireless-connectivity.webp",
    icon: "Wifi",
    productCategoryId: "wireless",
  },
  {
    title: "Integrated Security & Surveillance",
    summary:
      "Advanced IP cameras, video management systems, and intelligent monitoring to protect people, property, and assets.",
    image: "/services/09-security-surveillance.webp",
    icon: "Camera",
    productCategoryId: "surveillance",
  },
  {
    title: "Business Communication Systems",
    summary:
      "Modern IP telephony, VoIP, unified communications, and video conferencing for organizations of all sizes.",
    image: "/services/10-business-communication.webp",
    icon: "Phone",
    productCategoryId: "voip",
  },
  {
    title: "Smart Technology Integration",
    summary:
      "Unified access control, attendance, automation, IoT, and environmental monitoring for smarter, more efficient buildings.",
    image: "/services/11-smart-technology.webp",
    icon: "Cpu",
    productCategoryId: "wireless",
  },
  {
    title: "Infrastructure Enclosures & Rack Systems",
    summary:
      "Wall-mounted cabinets, floor-standing racks, outdoor enclosures, cooling accessories, and power distribution units.",
    image: "/services/12-enclosures-racks.webp",
    icon: "Boxes",
    productCategoryId: "racks",
  },
  {
    title: "Cable Routing & Infrastructure Management",
    summary:
      "Cable trays, trunking systems, ladder racks, and floor ducts for safe, organized, and maintainable cable installations.",
    image: "/services/13-cable-routing.webp",
    icon: "Route",
    productCategoryId: "cabling",
  },
  {
    title: "Critical Power & Backup Systems",
    summary:
      "UPS systems, PDUs, surge protection, and battery backup solutions that safeguard critical IT and communication equipment.",
    image: "/services/14-power-backup.webp",
    icon: "BatteryCharging",
    productCategoryId: "power",
  },
  {
    title: "Outdoor Network Infrastructure",
    summary:
      "OSP fiber cables, splice closures, distribution cabinets, and duct systems built for challenging outdoor environments.",
    image: "/services/15-outdoor-network.webp",
    icon: "RadioTower",
    productCategoryId: "fiber",
  },
  {
    title: "Network Testing & Professional Tools",
    summary:
      "Industry-standard fusion splicers, OTDRs, optical power meters, and certification testers for professional technicians.",
    image: "/services/16-network-testing-tools.webp",
    icon: "Gauge",
    productCategoryId: "tools",
  },
  {
    title: "Technology Consulting & Solution Design",
    summary:
      "Site assessments, network architecture design, Bills of Materials, and scalable recommendations tailored to your operations.",
    image: "/services/17-tech-consulting.webp",
    icon: "ClipboardList",
    productCategoryId: null,
  },
  {
    title: "Technical Support & Infrastructure Management",
    summary:
      "Proactive maintenance, remote monitoring, troubleshooting, and Annual Maintenance Contracts for long-term reliability.",
    image: "/services/18-technical-support.webp",
    icon: "Wrench",
    productCategoryId: null,
  },
  {
    title: "Enterprise Network Infrastructure",
    summary:
      "Reliable, secure, high-performance connectivity — routers, switches, enterprise Wi-Fi, and appliances that scale with you.",
    image: "/services/19-enterprise-network-infra.webp",
    icon: "Building2",
    productCategoryId: "networking",
  },
  {
    title: "Structured Connectivity Solutions",
    summary:
      "Complete structured cabling systems — copper cabling, patch panels, termination, testing, and certification.",
    image: "/services/20-structured-connectivity.webp",
    icon: "Layers",
    productCategoryId: "cabling",
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");

  let created = 0;
  let updated = 0;

  for (const [index, service] of SERVICES.entries()) {
    const result = await Service.findOneAndUpdate(
      { title: service.title },
      { $set: { ...service, order: index, status: "active" } },
      { upsert: true, includeResultMetadata: true }
    );
    if (result.lastErrorObject?.updatedExisting) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`Seed complete: ${created} created, ${updated} updated, ${SERVICES.length} total.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
