import AdminTaxonomyPage from "../../components/admin/AdminTaxonomyPage";

export default function AdminCategoriesPage() {
  return <AdminTaxonomyPage apiPath="/categories" plural="categories" label="category" />;
}
