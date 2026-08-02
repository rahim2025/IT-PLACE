// In-memory cache keyed by route (e.g. "products:all", "category:laptops"),
// scoped to the tab's lifetime (cleared on a full page reload). Lets a page
// seed its state from the last successful fetch instead of showing the
// loading skeleton again on every visit, while pages still revalidate in
// the background so the cache doesn't go stale forever.
const store = new Map();

export function getCached(key) {
  return store.get(key);
}

export function setCached(key, value) {
  store.set(key, value);
}
