import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Heart, Package, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { business } from "../data/content";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "#top", type: "anchor" },
  { label: "Services", href: "#services", type: "anchor" },
  { label: "Products", href: "/products", type: "route" },
  { label: "About", href: "#about", type: "anchor" },
  { label: "Why Us", href: "#why-us", type: "anchor" },
  { label: "Clients", href: "#clients", type: "anchor" },
  { label: "Contact", href: "#contact", type: "anchor" },
];

const ACCOUNT_LINKS = [
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/orders", label: "Orders", icon: Package },
];

function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-muted cursor-pointer"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
          {user.name?.[0]?.toUpperCase() || "U"}
        </span>
        {user.name?.split(" ")[0]}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-surface py-2 shadow-xl">
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-secondary hover:bg-muted hover:text-primary cursor-pointer"
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent/10 cursor-pointer"
            >
              <LayoutDashboard size={16} />
              Admin Panel
            </Link>
          )}
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 cursor-pointer"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleMobileLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  const handleAnchorClick = (href) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate(`/${href}`);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderLink = (link, className) => {
    if (link.type === "route") {
      const active = location.pathname === link.href;
      return (
        <Link
          to={link.href}
          onClick={() => setOpen(false)}
          aria-current={active ? "page" : undefined}
          className={`${className} ${active ? "text-accent" : ""} cursor-pointer`}
        >
          {link.label}
        </Link>
      );
    }
    return (
      <a
        href={link.href}
        onClick={(e) => {
          e.preventDefault();
          handleAnchorClick(link.href);
        }}
        className={`${className} cursor-pointer`}
      >
        {link.label}
      </a>
    );
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-surface/90 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="container-app flex h-16 md:h-20 items-center justify-between">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleAnchorClick("#top");
          }}
          className="flex items-center gap-2 font-extrabold text-lg md:text-xl text-primary cursor-pointer"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary ring-1 ring-white/15">
            IT
          </span>
          <span>
            Place<span className="text-accent">.</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {renderLink(
                link,
                "text-sm font-medium text-secondary hover:text-accent transition-colors duration-200"
              )}
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={business.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm hover:bg-accent-light transition-colors duration-200 cursor-pointer"
          >
            Get a Quote
          </a>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-secondary hover:text-accent transition-colors duration-200 cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-primary hover:bg-muted transition-colors duration-200 cursor-pointer"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg text-primary cursor-pointer"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-surface border-t border-border">
          <ul className="container-app flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {renderLink(link, "block py-3 text-base font-medium text-secondary hover:text-accent")}
              </li>
            ))}
            <li className="pt-2">
              <a
                href={business.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-primary cursor-pointer"
              >
                Get a Quote
              </a>
            </li>

            <li className="mt-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  {ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 text-base font-medium text-secondary hover:text-accent cursor-pointer"
                    >
                      <link.icon size={18} />
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 text-base font-medium text-accent cursor-pointer"
                    >
                      <LayoutDashboard size={18} />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleMobileLogout}
                    className="flex items-center gap-2.5 py-2.5 text-base font-medium text-destructive cursor-pointer"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-primary cursor-pointer"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
