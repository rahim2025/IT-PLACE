// Shared multipart/JSON body field parsing helpers used across the admin
// CRUD routes (products, services, categories, brands).
function parseListField(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
  } catch {
    // not JSON — fall back to comma-separated
  }
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseBool(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

module.exports = { parseListField, parseBool };
