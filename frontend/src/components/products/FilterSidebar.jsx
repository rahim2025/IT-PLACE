import FilterPanel from "./FilterPanel";

export default function FilterSidebar({ hookProps, isFiltersActive, onClearAll }) {
  return (
    <aside className="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-72 shrink-0 overflow-y-auto rounded-2xl border border-border bg-surface p-6 lg:block">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-primary">Filters</h2>
        {isFiltersActive && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-semibold text-accent hover:text-accent-light transition-colors duration-200 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <FilterPanel {...hookProps} />
    </aside>
  );
}
