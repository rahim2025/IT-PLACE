import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import FilterPanel from "./FilterPanel";

export default function FilterDrawer({ open, onClose, hookProps, isFiltersActive, onClearAll, resultCount }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="fixed inset-y-0 left-0 z-[95] flex w-[85%] max-w-sm flex-col bg-surface shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-base font-bold text-primary">Filters</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full text-secondary hover:bg-muted cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel {...hookProps} />
            </div>

            <div className="flex gap-3 border-t border-border p-5">
              {isFiltersActive && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold text-secondary hover:bg-muted cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-light cursor-pointer"
              >
                Show {resultCount} Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
