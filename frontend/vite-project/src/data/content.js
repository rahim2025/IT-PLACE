import {
  Network,
  Headset,
  Cable,
  Zap,
  Server,
  Database,
  ShieldCheck,
  Wifi,
  Camera,
  Phone,
  Cpu,
  Boxes,
  Route,
  BatteryCharging,
  RadioTower,
  Gauge,
  ClipboardList,
  Wrench,
  Building2,
  Layers,
} from "lucide-react";

export const business = {
  name: "ITPlace",
  tagline: "Your Trusted Technology Partner",
  founded: 2020,
  location: "Riyadh, Saudi Arabia",
  email: "itplace205@gmail.com",
  whatsapp: "+966554124031",
  whatsappLink: "https://wa.me/966554124031",
  stores: [
    {
      shortName: "Computer Market",
      name: "Computer Market, Olaya St, Al Olaya, Riyadh",
      mapsUrl: "https://www.google.com/maps?q=24.683011121490818,46.69002265094237",
      lat: 24.683011121490818,
      lng: 46.69002265094237,
    },
    {
      shortName: "Aseel Trading Est.",
      name: "Aseel Independent Trading Est., Olaya St, Al Olaya, Riyadh 12211",
      mapsUrl: "https://maps.app.goo.gl/z7tjBuRFFrJ4AsEz5",
      lat: 24.6820209,
      lng: 46.6906701,
    },
  ],
};

export const services = [
  {
    id: 1,
    title: "Network Design, Deployment & Integration",
    summary:
      "End-to-end networking solutions with scalable LAN, WAN, and wireless design, enterprise-grade deployment, and secure configuration.",
    image: "/services/01-network-design.png",
    icon: Network,
    productCategoryId: "networking",
  },
  {
    id: 2,
    title: "Managed Network Operations & Technical Support",
    summary:
      "Proactive monitoring, preventive maintenance, backup and disaster recovery, and rapid technical support to maximize uptime.",
    image: "/services/02-managed-network-ops.png",
    icon: Headset,
    productCategoryId: "networking",
  },
  {
    id: 3,
    title: "Fiber Connectivity Solutions",
    summary:
      "Ultra-fast, high-capacity fiber optic networks with professional supply and installation of cables, ODFs, and patch panels.",
    image: "/services/03-fiber-connectivity.png",
    icon: Cable,
    productCategoryId: "fiber",
  },
  {
    id: 4,
    title: "Fiber Integration & Splicing Services",
    summary:
      "Precise fusion splicing, termination, emergency restoration, OTDR testing, and fault diagnosis for optimal fiber performance.",
    image: "/services/04-fiber-splicing.png",
    icon: Zap,
    productCategoryId: "fiber",
  },
  {
    id: 5,
    title: "Mission-Critical Infrastructure",
    summary:
      "Reliable server room and data center infrastructure — rack deployment, structured cabling, cooling, and power distribution.",
    image: "/services/05-mission-critical-infra.png",
    icon: Server,
    productCategoryId: "racks",
  },
  {
    id: 6,
    title: "Enterprise Computing & Storage",
    summary:
      "Robust platforms for virtualization, backup, and centralized data management with reliable, scalable server and storage systems.",
    image: "/services/06-enterprise-computing-storage.png",
    icon: Database,
    productCategoryId: "servers",
  },
  {
    id: 7,
    title: "Digital Security & Protection",
    summary:
      "Firewalls, VPNs, access control, network segmentation, and endpoint protection for a secure, resilient IT environment.",
    image: "/services/07-digital-security.png",
    icon: ShieldCheck,
    productCategoryId: "networking",
  },
  {
    id: 8,
    title: "Wireless Connectivity Solutions",
    summary:
      "Enterprise wireless networks delivering seamless, secure, high-speed access across offices, hotels, and campuses.",
    image: "/services/08-wireless-connectivity.png",
    icon: Wifi,
    productCategoryId: "wireless",
  },
  {
    id: 9,
    title: "Integrated Security & Surveillance",
    summary:
      "Advanced IP cameras, video management systems, and intelligent monitoring to protect people, property, and assets.",
    image: "/services/09-security-surveillance.png",
    icon: Camera,
    productCategoryId: "surveillance",
  },
  {
    id: 10,
    title: "Business Communication Systems",
    summary:
      "Modern IP telephony, VoIP, unified communications, and video conferencing for organizations of all sizes.",
    image: "/services/10-business-communication.png",
    icon: Phone,
    productCategoryId: "voip",
  },
  {
    id: 11,
    title: "Smart Technology Integration",
    summary:
      "Unified access control, attendance, automation, IoT, and environmental monitoring for smarter, more efficient buildings.",
    image: "/services/11-smart-technology.png",
    icon: Cpu,
    productCategoryId: "wireless",
  },
  {
    id: 12,
    title: "Infrastructure Enclosures & Rack Systems",
    summary:
      "Wall-mounted cabinets, floor-standing racks, outdoor enclosures, cooling accessories, and power distribution units.",
    image: "/services/12-enclosures-racks.png",
    icon: Boxes,
    productCategoryId: "racks",
  },
  {
    id: 13,
    title: "Cable Routing & Infrastructure Management",
    summary:
      "Cable trays, trunking systems, ladder racks, and floor ducts for safe, organized, and maintainable cable installations.",
    image: "/services/13-cable-routing.png",
    icon: Route,
    productCategoryId: "cabling",
  },
  {
    id: 14,
    title: "Critical Power & Backup Systems",
    summary:
      "UPS systems, PDUs, surge protection, and battery backup solutions that safeguard critical IT and communication equipment.",
    image: "/services/14-power-backup.png",
    icon: BatteryCharging,
    productCategoryId: "power",
  },
  {
    id: 15,
    title: "Outdoor Network Infrastructure",
    summary:
      "OSP fiber cables, splice closures, distribution cabinets, and duct systems built for challenging outdoor environments.",
    image: "/services/15-outdoor-network.png",
    icon: RadioTower,
    productCategoryId: "fiber",
  },
  {
    id: 16,
    title: "Network Testing & Professional Tools",
    summary:
      "Industry-standard fusion splicers, OTDRs, optical power meters, and certification testers for professional technicians.",
    image: "/services/16-network-testing-tools.png",
    icon: Gauge,
    productCategoryId: "tools",
  },
  {
    id: 17,
    title: "Technology Consulting & Solution Design",
    summary:
      "Site assessments, network architecture design, Bills of Materials, and scalable recommendations tailored to your operations.",
    image: "/services/17-tech-consulting.png",
    icon: ClipboardList,
    productCategoryId: null,
  },
  {
    id: 18,
    title: "Technical Support & Infrastructure Management",
    summary:
      "Proactive maintenance, remote monitoring, troubleshooting, and Annual Maintenance Contracts for long-term reliability.",
    image: "/services/18-technical-support.png",
    icon: Wrench,
    productCategoryId: null,
  },
  {
    id: 19,
    title: "Enterprise Network Infrastructure",
    summary:
      "Reliable, secure, high-performance connectivity — routers, switches, enterprise Wi-Fi, and appliances that scale with you.",
    image: "/services/19-enterprise-network-infra.png",
    icon: Building2,
    productCategoryId: "networking",
  },
  {
    id: 20,
    title: "Structured Connectivity Solutions",
    summary:
      "Complete structured cabling systems — copper cabling, patch panels, termination, testing, and certification.",
    image: "/services/20-structured-connectivity.png",
    icon: Layers,
    productCategoryId: "cabling",
  },
];

export const coreValues = [
  {
    title: "Excellence",
    description:
      "We pursue the highest standards in every project, ensuring exceptional quality, precision, and customer satisfaction.",
  },
  {
    title: "Integrity",
    description:
      "We conduct our business with honesty, transparency, and accountability, building long-term relationships founded on trust.",
  },
  {
    title: "Innovation",
    description:
      "We continuously embrace new technologies and industry best practices to deliver forward-thinking solutions.",
  },
  {
    title: "Customer Focus",
    description:
      "Every solution begins with understanding our clients' objectives. Their success drives everything we do.",
  },
  {
    title: "Reliability",
    description:
      "We deliver dependable products, professional services, and responsive support that businesses can rely on daily.",
  },
  {
    title: "Collaboration",
    description:
      "We believe strong partnerships, teamwork, and shared knowledge create stronger solutions for our customers.",
  },
];

export const whyItplace = [
  {
    title: "Complete Technology Solutions",
    description:
      "From enterprise networking and fiber infrastructure to surveillance, cybersecurity, and data centers — one trusted partner.",
  },
  {
    title: "Engineering Expertise",
    description:
      "Experienced engineers and certified technicians bring deep technical knowledge to every project.",
  },
  {
    title: "Quality Without Compromise",
    description:
      "We supply products from globally recognized manufacturers, compliant with international standards.",
  },
  {
    title: "Tailored Business Solutions",
    description:
      "We design customized solutions aligned with your operational objectives and future growth.",
  },
  {
    title: "End-to-End Project Delivery",
    description:
      "From consultation and design to implementation, testing, documentation, and commissioning.",
  },
  {
    title: "Dedicated Technical Support",
    description:
      "Preventive maintenance, troubleshooting, AMC, and responsive after-sales service beyond project completion.",
  },
  {
    title: "Scalable Infrastructure",
    description:
      "Solutions designed to support today's needs while accommodating tomorrow's technological advancements.",
  },
  {
    title: "A Trusted Technology Partner",
    description:
      "Since 2020, ITPlace has earned the confidence of organizations through dependable, technical excellence.",
  },
];

export const clients = [
  {
    name: "Dr. Sulaiman Al Habib Hospital",
    location: "Al Kharj",
    work: "Data center optical fiber fusion splicing, cable pulling & dressing, server rack installation, and UTP data point termination.",
  },
];

export const stats = [
  { label: "Founded", value: "2020" },
  { label: "Services Delivered", value: "20+" },
  { label: "Sectors Served", value: "7+" },
  { label: "Store Locations", value: "2" },
];
