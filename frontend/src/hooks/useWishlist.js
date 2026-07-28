import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "itplace.wishlist";

function readStoredWishlist() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [ids, setIds] = useState(readStoredWishlist);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const isWishlisted = useCallback((id) => ids.includes(id), [ids]);

  const toggleWishlist = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }, []);

  return { wishlistIds: ids, isWishlisted, toggleWishlist };
}
