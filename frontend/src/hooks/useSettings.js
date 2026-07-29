import { useEffect, useState } from "react";
import { api } from "../utils/api";

// Business settings used for Organization/LocalBusiness structured data.
// Fetched once and cached in module scope so every page that needs it
// (currently just the homepage) doesn't refetch on every navigation.
let cache = null;

export function useSettings() {
  const [settings, setSettings] = useState(cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    api
      .get("/settings")
      .then((data) => {
        if (cancelled) return;
        cache = data.settings;
        setSettings(data.settings);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
