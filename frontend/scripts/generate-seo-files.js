// Runs before every `vite build` (wired as the `prebuild` npm script) and
// writes fresh sitemap.xml + robots.txt into public/, which Vite then
// copies verbatim into dist/. Since this site is static hosting (no
// persistent Node server — see src/seo/SeoHead.jsx for why), these files
// can't be generated per-request; instead they're regenerated on every
// deploy, which keeps them current as of the last build.
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", process.env.NODE_ENV === "production" ? ".env.production" : ".env") });

const SITE_URL = (process.env.VITE_SITE_URL || "https://itplace.shop").replace(/\/$/, "");
const API_URL = `${(process.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`generate-seo-files: failed to fetch ${path}:`, err.message);
    return null;
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(d) {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function toAbsoluteUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function urlEntry({ loc, lastmod, changefreq, priority, images }) {
  const imageTags = (images || [])
    .filter(Boolean)
    .map((img) => `<image:image><image:loc>${escapeXml(toAbsoluteUrl(img))}</image:loc></image:image>`)
    .join("");
  return [
    "<url>",
    `<loc>${escapeXml(loc)}</loc>`,
    lastmod ? `<lastmod>${lastmod}</lastmod>` : "",
    changefreq ? `<changefreq>${changefreq}</changefreq>` : "",
    priority ? `<priority>${priority}</priority>` : "",
    imageTags,
    "</url>",
  ].join("");
}

async function generateSitemap() {
  const entries = [
    urlEntry({ loc: `${SITE_URL}/`, changefreq: "daily", priority: "1.0" }),
    urlEntry({ loc: `${SITE_URL}/products`, changefreq: "daily", priority: "0.9" }),
  ];

  const [productsData, categoriesData, brandsData, servicesData] = await Promise.all([
    fetchJson("/products"),
    fetchJson("/categories"),
    fetchJson("/brands"),
    fetchJson("/services"),
  ]);

  for (const p of productsData?.products || []) {
    if (p.status !== "active") continue;
    entries.push(
      urlEntry({
        loc: `${SITE_URL}/products/${p.slug}`,
        lastmod: isoDate(p.updatedAt),
        changefreq: "weekly",
        priority: "0.8",
        images: p.images?.length ? p.images : p.image ? [p.image] : [],
      })
    );
  }

  for (const c of categoriesData?.categories || []) {
    if (c.status !== "active") continue;
    entries.push(
      urlEntry({
        loc: `${SITE_URL}/categories/${c.slug}`,
        lastmod: isoDate(c.updatedAt),
        changefreq: "weekly",
        priority: "0.7",
        images: c.image ? [c.image] : [],
      })
    );
  }

  for (const b of brandsData?.brands || []) {
    if (b.status !== "active") continue;
    entries.push(
      urlEntry({
        loc: `${SITE_URL}/brands/${b.slug}`,
        lastmod: isoDate(b.updatedAt),
        changefreq: "weekly",
        priority: "0.7",
        images: b.logo ? [b.logo] : [],
      })
    );
  }

  for (const s of servicesData?.services || []) {
    if (s.status !== "active") continue;
    entries.push(
      urlEntry({
        loc: `${SITE_URL}/services/${s.slug}`,
        lastmod: isoDate(s.updatedAt),
        changefreq: "monthly",
        priority: "0.6",
        images: s.image ? [s.image] : [],
      })
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join(
    "\n"
  )}\n</urlset>\n`;
}

function generateRobotsTxt() {
  const disallow = [
    "/admin",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/unauthorized",
    "/profile",
    "/wishlist",
    "/orders",
    "/checkout",
  ];
  return [
    "User-agent: *",
    ...disallow.map((p) => `Disallow: ${p}`),
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

async function main() {
  const sitemap = await generateSitemap();
  await writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf-8");
  await writeFile(path.join(PUBLIC_DIR, "robots.txt"), generateRobotsTxt(), "utf-8");
  console.log("generate-seo-files: wrote sitemap.xml and robots.txt to public/");
}

main().catch((err) => {
  // Never fail the whole build over a sitemap issue (e.g. backend briefly
  // unreachable) — log and continue with whatever sitemap.xml/robots.txt
  // already exist in public/ from the last successful run.
  console.error("generate-seo-files: failed, keeping existing public/ files:", err.message);
});
