// Converts a Mongoose ValidationError into the same { fieldErrors } shape
// used by the manual validators throughout the admin routes, so callers
// get a specific "SEO Title cannot be longer than 70 characters" instead
// of falling through to a generic 500 with no indication of what's wrong.
function formatMongooseValidationError(err) {
  if (err?.name !== "ValidationError") return null;
  const fieldErrors = {};
  for (const [field, fieldErr] of Object.entries(err.errors)) {
    fieldErrors[field] = fieldErr.message;
  }
  return fieldErrors;
}

module.exports = { formatMongooseValidationError };
