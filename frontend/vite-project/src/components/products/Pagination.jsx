import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageList(current, total) {
  const pages = [];
  const window = 1;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= window) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
}

export default function Pagination({ page, totalPages, onPageChange, total, startIndex, endIndex }) {
  if (totalPages <= 1) {
    return (
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Showing all {total} product{total === 1 ? "" : "s"}
      </p>
    );
  }

  const pages = getPageList(page, totalPages);

  return (
    <nav
      aria-label="Products pagination"
      className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-8"
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-primary">{startIndex}</span>–
        <span className="font-semibold text-primary">{endIndex}</span> of{" "}
        <span className="font-semibold text-primary">{total}</span> products — page{" "}
        <span className="font-semibold text-primary">{page}</span> of {totalPages}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-secondary transition-colors duration-200 hover:bg-muted disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                p === page ? "bg-accent text-white" : "text-secondary hover:bg-muted"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-secondary transition-colors duration-200 hover:bg-muted disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
