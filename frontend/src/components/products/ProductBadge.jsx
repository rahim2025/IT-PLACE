const VARIANTS = {
  new: "bg-accent text-white",
  sale: "bg-destructive text-white",
  bestseller: "bg-amber-500 text-white",
  outOfStock: "bg-muted text-muted-foreground",
};

export default function ProductBadge({ variant, children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
