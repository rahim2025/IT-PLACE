const Category = require("../models/Category");
const { buildTaxonomyRouter } = require("../utils/taxonomyRouter");

module.exports = buildTaxonomyRouter(Category, {
  label: "category",
  plural: "categories",
  countMatch: (doc) => ({ categoryId: doc.slug }),
});
