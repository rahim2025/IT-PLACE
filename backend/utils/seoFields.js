const { parseListField } = require("./requestFields");

// Extracts the optional admin-supplied SEO override fields shared by
// Product/Category/Brand/Service from a create/update request body. All
// fields are optional — the frontend SEO layer generates sensible defaults
// from the entity's normal content whenever these are left blank.
function parseSeoFields(body) {
  return {
    seoTitle: body.seoTitle?.trim() || "",
    seoDescription: body.seoDescription?.trim() || "",
    seoKeywords: parseListField(body.seoKeywords),
    canonicalUrl: body.canonicalUrl?.trim() || "",
    ogImage: body.ogImage?.trim() || "",
    socialTitle: body.socialTitle?.trim() || "",
    socialDescription: body.socialDescription?.trim() || "",
  };
}

module.exports = { parseSeoFields };
