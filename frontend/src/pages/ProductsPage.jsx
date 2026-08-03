import { useEffect, useState } from "react";
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
import { api } from "../utils/api";
import { getCached, setCached } from "../utils/pageCache";
import SeoHead from "../seo/SeoHead";
import { absoluteUrl } from "../seo/config";

const SKELETON_COUNT = 8;
const FILTER_OPTIONS_CACHE_KEY = "products:filter-options";

function ActiveFilterChips({
  filters,
  toggleArrayFilter,
  setRating,
  setPriceRange,
  setSearch,
  priceBounds,
  categories,
}) {
  const chips = [];

  filters.categories.forEach((id) => {
    const label = categories.find((c) => c.id === id)?.name || id;
    chips.push({ key: `cat-${id}`, label, onRemove: () => toggleArrayFilter("categories", id) });
  });
  filters.brands.forEach((brand) =>
    chips.push({ key: `brand-${brand}`, label: brand, onRemove: () => toggleArrayFilter("brands", brand) })
  );
  filters.availability.forEach((a) =>
    chips.push({ key: `avail-${a}`, label: a.replace("-", " "), onRemove: () => toggleArrayFilter("availability", a) })
  );
  if (filters.rating > 0) {
    chips.push({ key: "rating", label: `${filters.rating}+ Stars`, onRemove: () => setRating(0) });
  }
  if (filters.minPrice > priceBounds.min || filters.maxPrice < priceBounds.max) {
    chips.push({
      key: "price",
      label: `SAR ${filters.minPrice}–${filters.maxPrice}`,
      onRemove: () => setPriceRange(priceBounds.min, priceBounds.max),
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
  const initialOptionsCache = getCached(FILTER_OPTIONS_CACHE_KEY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [brands, setBrands] = useState(initialOptionsCache?.brands ?? []);
  const [categories, setCategories] = useState(initialOptionsCache?.categories ?? []);
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/brands").catch(() => ({ brands: [] })),
      api.get("/categories").catch(() => ({ categories: [] })),
    ]).then(([brandsData, categoriesData]) => {
      if (cancelled) return;
      const result = {
        brands: (brandsData.brands || []).map((brand) => brand.name).filter(Boolean).sort(),
        categories: (categoriesData.categories || [])
          .map((category) => ({ id: category.slug, name: category.name }))
          .filter((category) => category.id && category.name)
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
      setCached(FILTER_OPTIONS_CACHE_KEY, result);
      setBrands(result.brands);
      setCategories(result.categories);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    filters,
    toggleArrayFilter,
    setPriceRange,
    setRating,
    setSearch,
    setSort,
    setPage,
    clearAll,
    retry,
    isFiltersActive,
    priceBounds,
    results,
    status,
  } = useProductFilters();

  const hookProps = { filters, toggleArrayFilter, setPriceRange, setRating, priceBounds, brands, categories };

  return (
    <section className="bg-background py-16 md:py-24">
      <SeoHead
        title="Product Catalog | ITPlace"
        description="Browse enterprise networking gear, servers, surveillance, cabling, and more — sourced and supported by ITPlace, Saudi Arabia."
        canonical={absoluteUrl("/products")}
      />
      <div className="container-app">
        <SectionHeading
          as="h1"
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
            priceBounds={priceBounds}
            categories={categories}
          />
        </div>

        <div className="mt-8 flex items-start gap-8">
          <FilterSidebar hookProps={hookProps} isFiltersActive={isFiltersActive} onClearAll={clearAll} />

          <div className="min-w-0 flex-1">
            {status === "error" ? (
              <ProductsErrorState onRetry={retry} />
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
