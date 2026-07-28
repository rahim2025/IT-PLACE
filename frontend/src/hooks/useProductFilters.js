import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const PAGE_SIZE = 12;

const LIST_PARAM_KEYS = {
  categories: "category",
  brands: "brand",
  colors: "color",
  sizes: "size",
  tags: "tags",
  availability: "availability",
};

function parseList(param) {
  return param ? param.split(",").filter(Boolean) : [];
}

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function matchesAvailability(product, flags) {
  return flags.every((flag) => {
    switch (flag) {
      case "in-stock":
        return product.inStock;
      case "out-of-stock":
        return !product.inStock;
      case "discounted":
        return Boolean(product.compareAtPrice);
      case "new":
        return product.isNew;
      case "bestseller":
        return product.isBestSeller;
      default:
        return true;
    }
  });
}

function sortProducts(products, sort) {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating-desc":
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "az":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "newest":
      return list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.rating - a.rating);
    case "bestselling":
      return list.sort(
        (a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || b.reviewCount - a.reviewCount
      );
    case "popular":
      return list.sort((a, b) => b.reviewCount - a.reviewCount);
    case "featured":
    default:
      return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating);
  }
}

/**
 * Drives the Products page: filters, sorts, searches, and paginates a
 * product list, keeping every bit of state synced to the URL query string
 * so results are bookmarkable/shareable and survive back/forward navigation.
 */
export function useProductFilters(products, priceBounds) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      categories: parseList(searchParams.get("category")),
      brands: parseList(searchParams.get("brand")),
      colors: parseList(searchParams.get("color")),
      sizes: parseList(searchParams.get("size")),
      tags: parseList(searchParams.get("tags")),
      availability: parseList(searchParams.get("availability")),
      minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : priceBounds.min,
      maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : priceBounds.max,
      rating: searchParams.has("rating") ? Number(searchParams.get("rating")) : 0,
      search: searchParams.get("q") || "",
      sort: searchParams.get("sort") || "featured",
      page: searchParams.has("page") ? Math.max(1, Number(searchParams.get("page"))) : 1,
    }),
    [searchParams, priceBounds]
  );

  const updateParams = useCallback(
    (updater, { resetPage = true, replace = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          updater(next);
          if (resetPage) next.delete("page");
          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const toggleArrayFilter = useCallback(
    (key, value) => {
      const paramKey = LIST_PARAM_KEYS[key];
      const current = filters[key];
      const nextList = toggleInList(current, value);
      updateParams((next) => {
        if (nextList.length) next.set(paramKey, nextList.join(","));
        else next.delete(paramKey);
      });
    },
    [filters, updateParams]
  );

  const setPriceRange = useCallback(
    (min, max) => {
      updateParams((next) => {
        if (min <= priceBounds.min) next.delete("minPrice");
        else next.set("minPrice", String(Math.round(min)));
        if (max >= priceBounds.max) next.delete("maxPrice");
        else next.set("maxPrice", String(Math.round(max)));
      });
    },
    [updateParams, priceBounds]
  );

  const setRating = useCallback(
    (value) => {
      updateParams((next) => {
        if (!value) next.delete("rating");
        else next.set("rating", String(value));
      });
    },
    [updateParams]
  );

  const setSearch = useCallback(
    (value) => {
      updateParams((next) => {
        if (!value) next.delete("q");
        else next.set("q", value);
      });
    },
    [updateParams]
  );

  const setSort = useCallback(
    (value) => {
      updateParams(
        (next) => {
          if (!value || value === "featured") next.delete("sort");
          else next.set("sort", value);
        },
        { resetPage: false }
      );
    },
    [updateParams]
  );

  const setPage = useCallback(
    (value) => {
      updateParams(
        (next) => {
          if (value <= 1) next.delete("page");
          else next.set("page", String(value));
        },
        { resetPage: false, replace: false }
      );
    },
    [updateParams]
  );

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const filteredProducts = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return products.filter((product) => {
      if (filters.categories.length && !filters.categories.includes(product.categoryId)) return false;
      if (filters.brands.length && !filters.brands.includes(product.brand)) return false;
      if (filters.colors.length && !product.colors.some((c) => filters.colors.includes(c))) return false;
      if (filters.sizes.length && !product.sizes.some((s) => filters.sizes.includes(s))) return false;
      if (filters.tags.length && !product.tags.some((t) => filters.tags.includes(t))) return false;
      if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
      if (filters.rating > 0 && product.rating < filters.rating) return false;
      if (filters.availability.length && !matchesAvailability(product, filters.availability)) return false;

      if (query) {
        const haystack = `${product.name} ${product.brand} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [products, filters]);

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, filters.sort),
    [filteredProducts, filters.sort]
  );

  const total = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  const pageItems = useMemo(
    () => sortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedProducts, page]
  );

  const isFiltersActive = Boolean(
    filters.categories.length ||
      filters.brands.length ||
      filters.colors.length ||
      filters.sizes.length ||
      filters.tags.length ||
      filters.availability.length ||
      filters.rating > 0 ||
      filters.minPrice > priceBounds.min ||
      filters.maxPrice < priceBounds.max ||
      filters.search
  );

  return {
    filters,
    toggleArrayFilter,
    setPriceRange,
    setRating,
    setSearch,
    setSort,
    setPage,
    clearAll,
    isFiltersActive,
    results: {
      items: pageItems,
      total,
      totalPages,
      page,
      pageSize: PAGE_SIZE,
      startIndex: total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
      endIndex: Math.min(page * PAGE_SIZE, total),
    },
  };
}
