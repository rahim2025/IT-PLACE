import { Link } from "react-router-dom";
import { Compass, Home, Package, Wrench } from "lucide-react";
import SeoHead from "../seo/SeoHead";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center bg-background py-16 md:py-24">
      <SeoHead title="Page Not Found | ITPlace" robots="noindex, follow" />
      <div className="container-app">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Compass size={32} aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent">404 Error</p>
          <h1 className="mt-2 text-2xl font-bold text-primary md:text-3xl">Page Not Found</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The page you're looking for doesn't exist or may have been moved. Try one of the links below to find
            what you need.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
            >
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-muted cursor-pointer"
            >
              <Package size={16} />
              Browse Products
            </Link>
            <Link
              to="/#services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-muted cursor-pointer"
            >
              <Wrench size={16} />
              View Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
