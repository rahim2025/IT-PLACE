import AdminTaxonomyPage from "../../components/admin/AdminTaxonomyPage";

export default function AdminBrandsPage() {
  return <AdminTaxonomyPage apiPath="/brands" plural="brands" label="brand" imageField="logo" />;
}
