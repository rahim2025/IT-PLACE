const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "products");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed."));
    }
    cb(null, true);
  },
});

module.exports = { upload, UPLOAD_DIR };
