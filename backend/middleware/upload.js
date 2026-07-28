const fs = require("fs");
const path = require("path");
const multer = require("multer");

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

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "products");
const upload = createUploader("products", { maxFiles: 8 });
const uploadService = createUploader("services", { maxFiles: 1 });

module.exports = { upload, uploadService, createUploader, UPLOAD_DIR };
