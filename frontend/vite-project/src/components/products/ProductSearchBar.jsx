import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export default function ProductSearchBar({ value, onChange, placeholder = "Search products, brands, categories..." }) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const next = e.target.value;
    setLocalValue(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(next), 200);
  };

  const handleClear = () => {
    setLocalValue("");
    clearTimeout(debounceRef.current);
    onChange("");
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div className="relative flex-1">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-11 text-sm text-foreground outline-none transition-colors focus:border-accent"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
