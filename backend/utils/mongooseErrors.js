// Human-readable labels for fields that can fail Mongoose validation
// across Product/Service/Category/Brand — used to turn a raw Mongoose
// error path ("seoTitle") into something an admin actually understands
// ("SEO Title").
const FIELD_LABELS = {
  name: "Name",
  title: "Title",
  summary: "Summary",
  description: "Description",
  slug: "Slug",
  sku: "SKU",
  seoTitle: "SEO Title",
  seoDescription: "Meta Description",
  socialTitle: "Social Share Title",
  socialDescription: "Social Share Description",
  canonicalUrl: "Canonical URL",
  ogImage: "Open Graph Image URL",
};

function labelFor(field) {
  return FIELD_LABELS[field] || field;
}

function messageFor(field, validatorErr) {
  const label = labelFor(field);
  if (validatorErr.kind === "maxlength") {
    const max = validatorErr.properties?.maxlength;
    const actual = String(validatorErr.value ?? "").length;
    return `${label} must be ${max} characters or fewer — you entered ${actual}.`;
  }
  if (validatorErr.kind === "required") {
    return `${label} is required.`;
  }
  if (validatorErr.kind === "enum") {
    return `${label} has an invalid value.`;
  }
  return `${label}: ${validatorErr.message}`;
}

// Converts a Mongoose ValidationError into { error, fieldErrors } — a
// human-readable top-level summary plus per-field messages — so a save
// that fails on e.g. a 70-character SEO Title limit tells the admin
// exactly what's wrong instead of falling through to a generic 500.
function formatMongooseValidationError(err) {
  if (err?.name !== "ValidationError") return null;
  const fieldErrors = {};
  for (const [field, fieldErr] of Object.entries(err.errors)) {
    fieldErrors[field] = messageFor(field, fieldErr);
  }
  const summary = Object.values(fieldErrors).join(" ");
  return { error: summary, fieldErrors };
}

module.exports = { formatMongooseValidationError };
