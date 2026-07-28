const Brand = require("../models/Brand");
const { buildTaxonomyRouter } = require("../utils/taxonomyRouter");

module.exports = buildTaxonomyRouter(Brand, {
  label: "brand",
  countMatch: (doc) => ({ brand: doc.name }),
});
