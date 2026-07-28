import { PackageSearch, ServerCrash } from "lucide-react";

export function EmptyProductsState({ onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PackageSearch size={28} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-primary">No products match your filters</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Try widening your price range, clearing a filter, or searching a different term.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
      >
        Clear All Filters
      </button>
    </div>
  );
}

export function ProductsErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ServerCrash size={28} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-primary">Couldn't load products</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Something went wrong while loading the catalog. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
