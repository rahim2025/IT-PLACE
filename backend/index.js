require("dotenv").config();
const path = require("path");
const express = require("express");
const multer = require("multer");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const contactRouter = require("./routes/contact");
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const categoriesRouter = require("./routes/categories");
const brandsRouter = require("./routes/brands");
const servicesRouter = require("./routes/services");
const clientsRouter = require("./routes/clients");
const settingsRouter = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itplace";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// DNS serves the same site on both the apex and "www" host, with no redirect
// between them, so both are live origins in production — allow-listing just
// one (via CLIENT_ORIGIN) silently breaks every API call for visitors who
// land on the other host (e.g. via a search result that links to "www").
app.use(compression());

const ALLOWED_ORIGINS = new Set([CLIENT_ORIGIN, CLIENT_ORIGIN.replace("://", "://www.")]);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// This host is the API only — it should never be indexed itself (the
// storefront's own robots.txt/sitemap.xml on itplace.shop cover crawling).
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nDisallow: /\n");
});

app.use("/api/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/settings", settingsRouter);

// Multer (image upload) errors and the custom fileFilter rejection thrown in
// middleware/upload.js bypass route handlers entirely and land here — without
// this, Express's default handler returns an HTML page instead of JSON, and
// the frontend falls back to a generic "Something went wrong" message.
app.use((err, req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "One of your images is larger than 5MB. Please use a smaller image and try again." });
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Too many images — you can upload up to 8 per product." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message && /images are allowed/i.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  console.error("Unhandled server error:", err.stack || err.message);
  res.status(500).json({ error: "Something went wrong on our end. Please try again." });
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.listen(PORT, () => {
  console.log(`ITPlace API listening on port ${PORT}`);
});
