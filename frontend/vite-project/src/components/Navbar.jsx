import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { business } from "../data/content";

const NAV_LINKS = [
  { label: "Home", href: "#top", type: "anchor" },
  { label: "Services", href: "#services", type: "anchor" },
  { label: "Products", href: "/products", type: "route" },
  { label: "About", href: "#about", type: "anchor" },
  { label: "Why Us", href: "#why-us", type: "anchor" },
  { label: "Clients", href: "#clients", type: "anchor" },
  { label: "Contact", href: "#contact", type: "anchor" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

        <a
          href={business.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm hover:bg-accent-light transition-colors duration-200 cursor-pointer"
        >
          Get a Quote
        </a>

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
          </ul>
        </div>
      )}
    </header>
  );
}
