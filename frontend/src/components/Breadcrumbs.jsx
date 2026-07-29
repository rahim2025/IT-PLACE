import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

// items: [{ label, to }] — the last item is treated as the current page
// (rendered as plain text, not a link), matching BreadcrumbList semantics.
export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-1 text-muted-foreground transition-colors duration-200 hover:text-accent"
          >
            <Home size={14} aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
          <ChevronRight size={14} className="text-border" aria-hidden="true" />
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.to || item.label} className="flex items-center gap-1.5">
              {isLast || !item.to ? (
                <span className="font-medium text-primary" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="text-muted-foreground transition-colors duration-200 hover:text-accent">
                  {item.label}
                </Link>
              )}
              {!isLast && <ChevronRight size={14} className="text-border" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
