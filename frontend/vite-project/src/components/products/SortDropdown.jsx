import { ChevronDown } from "lucide-react";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "az", label: "Alphabetical: A-Z" },
  { value: "za", label: "Alphabetical: Z-A" },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="relative">
      <label htmlFor="sort-products" className="sr-only">
        Sort products
      </label>
      <select
        id="sort-products"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-full border border-border bg-surface py-2.5 pl-4 pr-10 text-sm font-semibold text-primary outline-none transition-colors focus:border-accent sm:w-56"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
