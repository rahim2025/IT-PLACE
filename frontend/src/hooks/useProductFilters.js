import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import { getCached, setCached } from "../utils/pageCache";

export const PAGE_SIZE = 12;

const LIST_PARAM_KEYS = {
  categories: "category",
  brands: "brand",
  availability: "availability",
};

const EMPTY_RESULTS = {
  items: [],
  total: 0,
  totalPages: 1,
  page: 1,
  pageSize: PAGE_SIZE,
  startIndex: 0,
  endIndex: 0,
};

function parseList(param) {
  return param ? param.split(",").filter(Boolean) : [];
}

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function buildQueryString(searchParams) {
  const query = new URLSearchParams(searchParams);
  if (!query.has("page")) query.set("page", "1");
  query.set("pageSize", String(PAGE_SIZE));
  return query.toString();
}

/**
 * Drives the Products page: keeps filters/sort/search/page synced to the URL
 * query string (bookmarkable, survives back/forward), and fetches the
 * matching page of results from the server — the catalog itself is filtered
 * and paginated in MongoDB rather than pulled down whole and sliced client-side.
 */
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const initialCache = getCached(`products:${buildQueryString(searchParams)}`);
  const [results, setResults] = useState(initialCache ?? EMPTY_RESULTS);
  const [status, setStatus] = useState(initialCache ? "success" : "loading");
  const [retryToken, setRetryToken] = useState(0);
  const requestToken = useRef(0);

  const filters = useMemo(
    () => ({
      categories: parseList(searchParams.get("category")),
      brands: parseList(searchParams.get("brand")),
      availability: parseList(searchParams.get("availability")),
      minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : priceBounds.min,
      maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : priceBounds.max,
      rating: searchParams.has("rating") ? Number(searchParams.get("rating")) : 0,
      search: searchParams.get("q") || "",
      sort: searchParams.get("sort") || "featured",
      page: searchParams.has("page") ? Math.max(1, Number(searchParams.get("page"))) : 1,
    }),
    [searchParams, priceBounds.min, priceBounds.max]
  );

  useEffect(() => {
    let cancelled = false;
    api
      .get("/products/price-bounds")
      .then((data) => {
        if (!cancelled) setPriceBounds({ min: data.min, max: data.max });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const queryString = buildQueryString(searchParams);
    const cacheKey = `products:${queryString}`;
    const cached = getCached(cacheKey);
    const token = ++requestToken.current;

    if (cached) {
      setResults(cached);
      setStatus("success");
    } else {
      setStatus("loading");
    }

    api
      .get(`/products?${queryString}`)
      .then((data) => {
        if (requestToken.current !== token) return;
        const result = {
          items: data.products,
          total: data.total,
          totalPages: data.totalPages,
          page: data.page,
          pageSize: data.pageSize,
          startIndex: data.startIndex,
          endIndex: data.endIndex,
        };
        setCached(cacheKey, result);
        setResults(result);
        setStatus("success");
      })
      .catch(() => {
        if (requestToken.current !== token) return;
        if (!cached) setStatus("error");
      });
  }, [searchParams, retryToken]);

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

  const retry = useCallback(() => setRetryToken((t) => t + 1), []);

  const isFiltersActive = Boolean(
    filters.categories.length ||
      filters.brands.length ||
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
    retry,
    isFiltersActive,
    priceBounds,
    results,
    status,
  };
}
