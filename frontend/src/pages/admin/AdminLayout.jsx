import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Tags,
  Award,
  Wrench,
  Building2,
  ClipboardList,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/products/new", label: "Add Product", icon: PackagePlus },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/brands", label: "Brands", icon: Award },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/clients", label: "Clients", icon: Building2 },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              isActive ? "bg-accent text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-primary lg:flex">
        <div className="flex h-16 items-center gap-2 px-5 font-extrabold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">IT</span>
          Admin Panel
        </div>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-72 max-w-[80%] flex-col bg-primary">
            <div className="flex h-16 items-center justify-between px-5 font-extrabold text-white">
              Admin Panel
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted cursor-pointer lg:hidden"
          >
            <Menu size={20} />
          </button>
          <span className="hidden text-sm text-muted-foreground lg:block">Manage your storefront</span>
          <div className="flex items-center gap-1.5 md:gap-3">
            <a
              href="/"
              title="View Store"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-muted hover:text-primary cursor-pointer md:px-3"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">View Store</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              title="Log Out"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/5 cursor-pointer md:px-3"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <span className="hidden text-sm font-semibold text-primary sm:block">{user?.name}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
