const fs = require("fs");
const path = require("path");
const multer = require("multer");

// sharp ships a platform-specific native binary — on some shared hosting
// environments (missing system libs, build/runtime container mismatch)
// it can fail to load entirely. Guard the require so a broken sharp
// install degrades WebP conversion instead of crashing the whole app.
let sharp = null;
try {
  sharp = require("sharp");
} catch (err) {
  console.error("sharp failed to load — WebP conversion disabled, uploads will keep their original format:", err.message);
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function createUploader(subdir, { maxFiles = 8 } = {}) {
  const dir = path.join(__dirname, "..", "uploads", subdir);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: maxFiles },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_TYPES.has(file.mimetype)) {
        return cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed."));
      }
      cb(null, true);
    },
  });
}

// Converts every uploaded file to WebP in place — smaller files, and every
// modern browser supports it natively, so there's no need to juggle a
// fallback format. Animated GIFs are left alone (sharp's default WebP
// export would silently drop the animation). A conversion failure logs and
// keeps the original file rather than failing the whole request.
async function convertToWebp(req, res, next) {
  if (!sharp) return next();
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    if (file.mimetype === "image/gif") continue;
    try {
      const dir = path.dirname(file.path);
      const webpFilename = file.filename.replace(/\.[^.]+$/, ".webp");
      const webpPath = path.join(dir, webpFilename);
      await sharp(file.path).webp({ quality: 82 }).toFile(webpPath);
      if (file.path !== webpPath) fs.unlink(file.path, () => {});
      file.filename = webpFilename;
      file.path = webpPath;
    } catch (err) {
      console.error(`WebP conversion failed for ${file.filename}, keeping original:`, err.message);
    }
  }
  next();
}

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "products");
const upload = createUploader("products", { maxFiles: 8 });
const uploadService = createUploader("services", { maxFiles: 1 });

module.exports = { upload, uploadService, createUploader, convertToWebp, UPLOAD_DIR };
