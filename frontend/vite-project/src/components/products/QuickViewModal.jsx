import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, MessageCircle } from "lucide-react";
import StarRating from "./StarRating";
import ProductBadge from "./ProductBadge";
import { formatPrice } from "../../utils/format";
import { business } from "../../data/content";

export default function QuickViewModal({ product, onClose, isWishlisted, onToggleWishlist }) {
  useEffect(() => {
    if (!product) return undefined;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const quoteMessage = encodeURIComponent(
    `Hi ITPlace, I'd like more information about: ${product.name} (${product.sku})`
  );

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} details`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-surface shadow-2xl md:grid-cols-2"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-black/80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="aspect-square w-full bg-muted md:aspect-auto">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>

            <div className="flex max-h-[80vh] flex-col overflow-y-auto p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-1.5">
                {product.isNew && <ProductBadge variant="new">New</ProductBadge>}
                {product.compareAtPrice && <ProductBadge variant="sale">Sale</ProductBadge>}
                {product.isBestSeller && <ProductBadge variant="bestseller">Bestseller</ProductBadge>}
              </div>

              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {product.category} • {product.brand} • SKU {product.sku}
              </p>
              <h2 className="mt-1 text-xl font-bold text-primary md:text-2xl">{product.name}</h2>

              <div className="mt-3">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className={`mt-2 text-sm font-semibold ${product.inStock ? "text-success" : "text-destructive"}`}>
                {product.inStock ? `In Stock — ${product.stock} available` : "Out of Stock"}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-secondary">{product.description}</p>

              {product.colors.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <span key={c} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-secondary">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <span key={s} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-secondary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`${business.whatsappLink}?text=${quoteMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
                >
                  <MessageCircle size={16} />
                  Enquire on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-pressed={isWishlisted}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-secondary transition-colors duration-200 hover:bg-muted cursor-pointer"
                >
                  <Heart size={16} className={isWishlisted ? "fill-destructive text-destructive" : ""} />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
