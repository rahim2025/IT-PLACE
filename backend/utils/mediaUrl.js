// Uploaded files (/uploads/...) are served by this backend, so in
// production — where the frontend and backend live on different
// subdomains — their URLs need the backend's own public origin prepended.
// Static seed images (e.g. /services/*.png) ship inside the frontend's
// public/ folder instead and must stay relative so they resolve against
// the frontend's own origin.
function resolveMediaUrl(path) {
  if (!path) return path;
  const base = process.env.PUBLIC_URL || "";
  if (!base || !path.startsWith("/uploads/")) return path;
  return `${base}${path}`;
}

module.exports = { resolveMediaUrl };
