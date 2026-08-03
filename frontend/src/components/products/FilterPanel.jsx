import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatPrice } from "../../utils/format";

const AVAILABILITY_OPTIONS = [
  { value: "in-stock", label: "In Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
  { value: "discounted", label: "Discounted Items" },
  { value: "new", label: "New Arrivals" },
  { value: "bestseller", label: "Best Sellers" },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-5 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left cursor-pointer"
      >
        <span className="text-sm font-bold text-primary">{title}</span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function CheckboxRow({ checked, onChange, label, count }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-sm text-secondary">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-border text-accent accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
        {label}
      </span>
      {typeof count === "number" && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

export default function FilterPanel({
  filters,
  toggleArrayFilter,
  setPriceRange,
  setRating,
  priceBounds,
  brands,
  categories,
}) {
  const [localMin, setLocalMin] = useState(filters.minPrice);
  const [localMax, setLocalMax] = useState(filters.maxPrice);

  return (
    <div>
      <FilterSection title="Brand">
        <div className="max-h-52 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <CheckboxRow
              key={brand}
              checked={filters.brands.includes(brand)}
              onChange={() => toggleArrayFilter("brands", brand)}
              label={brand}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Category">
        {categories.map((cat) => (
          <CheckboxRow
            key={cat.id}
            checked={filters.categories.includes(cat.id)}
            onChange={() => toggleArrayFilter("categories", cat.id)}
            label={cat.name}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="px-0.5">
          <div className="flex items-center justify-between text-sm font-semibold text-primary">
            <span>{formatPrice(localMin)}</span>
            <span>{formatPrice(localMax)}</span>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={localMin}
              onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax))}
              onMouseUp={() => setPriceRange(localMin, localMax)}
              onTouchEnd={() => setPriceRange(localMin, localMax)}
              aria-label="Minimum price"
              className="w-full accent-accent"
            />
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={localMax}
              onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin))}
              onMouseUp={() => setPriceRange(localMin, localMax)}
              onTouchEnd={() => setPriceRange(localMin, localMax)}
              aria-label="Maximum price"
              className="w-full accent-accent"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        {[4, 3, 2, 1].map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-secondary"
          >
            <input
              type="radio"
              name="rating"
              checked={filters.rating === value}
              onChange={() => setRating(filters.rating === value ? 0 : value)}
              className="h-4 w-4 border-border text-accent accent-accent"
            />
            {value}+ Stars &amp; Up
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Availability">
        {AVAILABILITY_OPTIONS.map((opt) => (
          <CheckboxRow
            key={opt.value}
            checked={filters.availability.includes(opt.value)}
            onChange={() => toggleArrayFilter("availability", opt.value)}
            label={opt.label}
          />
        ))}
      </FilterSection>
    </div>
  );
}
