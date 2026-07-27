import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/products/ProductCard";
import ProductCardSkeleton from "../components/products/ProductCardSkeleton";
import { EmptyProductsState, ProductsErrorState } from "../components/products/EmptyState";
import FilterSidebar from "../components/products/FilterSidebar";
import FilterDrawer from "../components/products/FilterDrawer";
import SortDropdown from "../components/products/SortDropdown";
import ProductSearchBar from "../components/products/ProductSearchBar";
import Pagination from "../components/products/Pagination";
import QuickViewModal from "../components/products/QuickViewModal";
import { useProductFilters } from "../hooks/useProductFilters";
import { useWishlist } from "../hooks/useWishlist";
import { PRODUCTS, PRICE_BOUNDS, CATEGORIES } from "../data/products";

const SKELETON_COUNT = 8;

function ActiveFilterChips({ filters, toggleArrayFilter, setRating, setPriceRange, setSearch }) {
  const chips = [];

  filters.categories.forEach((id) => {
    const label = CATEGORIES.find((c) => c.id === id)?.name || id;
    chips.push({ key: `cat-${id}`, label, onRemove: () => toggleArrayFilter("categories", id) });
  });
  filters.brands.forEach((brand) =>
    chips.push({ key: `brand-${brand}`, label: brand, onRemove: () => toggleArrayFilter("brands", brand) })
  );
  filters.colors.forEach((c) =>
    chips.push({ key: `color-${c}`, label: c, onRemove: () => toggleArrayFilter("colors", c) })
  );
  filters.sizes.forEach((s) =>
    chips.push({ key: `size-${s}`, label: s, onRemove: () => toggleArrayFilter("sizes", s) })
  );
  filters.tags.forEach((t) =>
    chips.push({ key: `tag-${t}`, label: t, onRemove: () => toggleArrayFilter("tags", t) })
  );
  filters.availability.forEach((a) =>
    chips.push({ key: `avail-${a}`, label: a.replace("-", " "), onRemove: () => toggleArrayFilter("availability", a) })
  );
  if (filters.rating > 0) {
    chips.push({ key: "rating", label: `${filters.rating}+ Stars`, onRemove: () => setRating(0) });
  }
  if (filters.minPrice > PRICE_BOUNDS.min || filters.maxPrice < PRICE_BOUNDS.max) {
    chips.push({
      key: "price",
      label: `SAR ${filters.minPrice}–${filters.maxPrice}`,
      onRemove: () => setPriceRange(PRICE_BOUNDS.min, PRICE_BOUNDS.max),
    });
  }
  if (filters.search) {
    chips.push({ key: "search", label: `"${filters.search}"`, onRemove: () => setSearch("") });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold capitalize text-accent transition-colors duration-200 hover:bg-accent/20 cursor-pointer"
        >
          {chip.label}
          <X size={12} />
        </button>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [status, setStatus] = useState("loading");
  const [retryToken, setRetryToken] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Simulated async catalog load so the loading-skeleton / error-state code
  // paths are real and exercised, even though the data here is local. Swap
  // this effect for a real fetch() once a products API/endpoint exists.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    const timer = setTimeout(() => {
      if (!cancelled) setStatus("success");
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [retryToken]);

  const {
    filters,
    toggleArrayFilter,
    setPriceRange,
    setRating,
    setSearch,
    setSort,
    setPage,
    clearAll,
    isFiltersActive,
    results,
  } = useProductFilters(PRODUCTS, PRICE_BOUNDS);

  const hookProps = useMemo(
    () => ({ filters, toggleArrayFilter, setPriceRange, setRating, priceBounds: PRICE_BOUNDS }),
    [filters, toggleArrayFilter, setPriceRange, setRating]
  );

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Product Catalog"
          title="Networking & IT Equipment"
          description="Browse enterprise networking gear, servers, surveillance, cabling, and more — sourced and supported by ITPlace."
          align="left"
        />

        <div className="sticky top-16 z-20 -mx-4 mt-10 bg-background/95 px-4 py-3 backdrop-blur-sm md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ProductSearchBar value={filters.search} onChange={setSearch} />
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-muted cursor-pointer lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
              {isFiltersActive && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
              )}
            </button>
            <SortDropdown value={filters.sort} onChange={setSort} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{results.total}</span> product
            {results.total === 1 ? "" : "s"} found
          </p>
          <ActiveFilterChips
            filters={filters}
            toggleArrayFilter={toggleArrayFilter}
            setRating={setRating}
            setPriceRange={setPriceRange}
            setSearch={setSearch}
          />
        </div>

        <div className="mt-8 flex items-start gap-8">
          <FilterSidebar hookProps={hookProps} isFiltersActive={isFiltersActive} onClearAll={clearAll} />

          <div className="min-w-0 flex-1">
            {status === "error" ? (
              <ProductsErrorState onRetry={() => setRetryToken((t) => t + 1)} />
            ) : status === "loading" ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : results.items.length === 0 ? (
              <EmptyProductsState onClearFilters={clearAll} />
            ) : (
              <>
                <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {results.items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={isWishlisted(product.id)}
                        onToggleWishlist={toggleWishlist}
                        onQuickView={setQuickViewProduct}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                <Pagination
                  page={results.page}
                  totalPages={results.totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  total={results.total}
                  startIndex={results.startIndex}
                  endIndex={results.endIndex}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        hookProps={hookProps}
        isFiltersActive={isFiltersActive}
        onClearAll={clearAll}
        resultCount={results.total}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
        onToggleWishlist={toggleWishlist}
      />
    </section>
  );
}
