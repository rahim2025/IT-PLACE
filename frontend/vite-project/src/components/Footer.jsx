import { Mail, MessageCircle, MapPin, Store, ChevronRight } from "lucide-react";
import { business } from "../data/content";

const QUICK_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Services", href: "#services" },
  { label: "About Us", href: "#about" },
  { label: "Why ITPlace", href: "#why-us" },
  { label: "Our Clients", href: "#clients" },
];

const SUPPORT_LINKS = [
  { label: "Request a Quote", href: "#contact" },
  { label: "Technical Support", href: "#why-us" },
  { label: "AMC & Maintenance", href: "#why-us" },
  { label: "Site Assessment", href: "#contact" },
  { label: "Contact Us", href: "#contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollTo = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 bg-charcoal text-slate-400">
      <div className="container-app py-14">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#top");
              }}
              className="flex items-center gap-2 text-2xl font-extrabold text-white cursor-pointer"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
                IT
              </span>
              Place<span className="text-accent-light">.</span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              ITPlace stands at the forefront as a trusted provider of network infrastructure,
              ICT solutions, and security systems in the Kingdom of Saudi Arabia. Our commitment
              is to be the most reliable technology partner in the region.
            </p>
            <button
              type="button"
              onClick={() => scrollTo("#about")}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-light transition-colors duration-200 hover:text-white cursor-pointer"
            >
              <ChevronRight size={16} className="shrink-0" />
              Read More
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.href)}
                    className="text-left transition-colors duration-200 hover:text-accent-light cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Need Help?</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.href)}
                    className="text-left transition-colors duration-200 hover:text-accent-light cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Contact Us</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={business.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors duration-200 hover:text-accent-light cursor-pointer"
                >
                  <MessageCircle size={16} className="shrink-0" />
                  {business.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-2.5 transition-colors duration-200 hover:text-accent-light cursor-pointer"
                >
                  <Mail size={16} className="shrink-0" />
                  {business.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                {business.location}
              </li>
            </ul>

            <h4 className="mt-6 text-sm font-bold text-white">ITPlace Stores</h4>
            <ul className="mt-3 space-y-2.5 text-sm">
              {business.stores.map((store) => (
                <li key={store.name}>
                  <a
                    href={store.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 transition-colors duration-200 hover:text-accent-light cursor-pointer"
                  >
                    <Store size={16} className="mt-0.5 shrink-0" />
                    <span>{store.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} ITPlace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors duration-200 hover:text-accent-light cursor-pointer">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors duration-200 hover:text-accent-light cursor-pointer">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
