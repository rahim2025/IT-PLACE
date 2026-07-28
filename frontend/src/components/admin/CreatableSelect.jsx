import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Loader2, Check } from "lucide-react";
import { api, ApiError } from "../../utils/api";
import { useToast } from "../../context/ToastContext";

// Searchable dropdown for picking a Category/Brand by name, with an inline
// "create new" option when the typed value doesn't match anything existing.
export default function CreatableSelect({ apiPath, plural, label, value, onSelect, error }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    api
      .get(apiPath)
      .then((data) => setItems(data[plural]))
      .finally(() => setLoading(false));
  }, [apiPath, plural]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, query]);

  const exactMatch = items.some((it) => it.name.toLowerCase() === query.trim().toLowerCase());
  const canCreate = query.trim().length > 0 && !exactMatch;

  const handleSelect = (item) => {
    onSelect(item);
    setOpen(false);
    setQuery("");
  };

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    try {
      const data = await api.post(apiPath, { name, status: "active" });
      const created = data[label];
      setItems((prev) => [...prev, created]);
      toast.success(`${label === "category" ? "Category" : "Brand"} "${name}" was created.`);
      handleSelect(created);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Could not create this ${label}.`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-invalid={Boolean(error)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground outline-none transition-colors focus:border-accent cursor-pointer"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || `Select a ${label}...`}</span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${plural}...`}
            className="w-full border-b border-border px-4 py-2.5 text-sm text-foreground outline-none"
          />
          <div className="max-h-48 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : filtered.length === 0 && !canCreate ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No {plural} found.</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-secondary hover:bg-muted hover:text-primary cursor-pointer"
                >
                  {item.name}
                  {value === item.name && <Check size={14} className="text-accent" />}
                </button>
              ))
            )}
            {canCreate && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-left text-sm font-semibold text-accent hover:bg-accent/10 disabled:opacity-60 cursor-pointer"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create "{query.trim()}"
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
