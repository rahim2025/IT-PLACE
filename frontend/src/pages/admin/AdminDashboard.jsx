import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Users, ClipboardList, DollarSign, Loader2 } from "lucide-react";
import { api } from "../../utils/api";
import { formatPrice } from "../../utils/format";

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-extrabold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [userCount, setUserCount] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get("/products"), api.get("/users").catch(() => ({ users: [] }))])
      .then(([productsData, usersData]) => {
        if (cancelled) return;
        setProducts(productsData.products);
        setUserCount(usersData.users.length);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  const recentlyAdded = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentlyUpdated = [...products]
    .filter((p) => p.updatedAt !== p.createdAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">A quick overview of your storefront.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={products.length} />
        <StatCard icon={Users} label="Total Users" value={userCount ?? "—"} />
        <StatCard icon={ClipboardList} label="Total Orders" value="0" hint="Order tracking coming soon" />
        <StatCard icon={DollarSign} label="Revenue" value={formatPrice(0)} hint="Coming soon" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-base font-bold text-primary">Recently Added Products</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {recentlyAdded.length === 0 && <p className="text-sm text-muted-foreground">No products yet.</p>}
            {recentlyAdded.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/products/${p.id}/edit`} className="block truncate text-sm font-semibold text-primary hover:text-accent">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-base font-bold text-primary">Recently Updated Products</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {recentlyUpdated.length === 0 && <p className="text-sm text-muted-foreground">No updates yet.</p>}
            {recentlyUpdated.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/products/${p.id}/edit`} className="block truncate text-sm font-semibold text-primary hover:text-accent">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
