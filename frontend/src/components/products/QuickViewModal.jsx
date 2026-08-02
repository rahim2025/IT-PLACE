import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import StarRating from "./StarRating";
import ProductBadge from "./ProductBadge";
import WhatsAppIcon from "../WhatsAppIcon";
import { formatPrice } from "../../utils/format";
import { formatStockCount } from "../../utils/formatStock";
import { business } from "../../data/content";

export default function QuickViewModal({ product, onClose, isWishlisted, onToggleWishlist }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = product?.images?.length ? product.images : product ? [product.image] : [];

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  const showPrev = () => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    if (!product) return undefined;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) showPrev();
      if (e.key === "ArrowRight" && images.length > 1) showNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [product, onClose, images.length]);

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
          className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
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
            className="relative my-8 grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-surface shadow-2xl sm:my-0 md:grid-cols-2"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-black/80 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col bg-muted">
              <div className="relative aspect-square w-full overflow-hidden md:aspect-auto md:flex-1">
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={`${product.name} — image ${activeImage + 1} of ${images.length}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_e, info) => {
                    if (info.offset.x < -60) showNext();
                    else if (info.offset.x > 60) showPrev();
                  }}
                  className={`h-full w-full object-cover ${images.length > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
                  draggable={false}
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrev}
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-200 hover:bg-black/70 cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-200 hover:bg-black/70 cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          aria-label={`Show image ${i + 1}`}
                          aria-current={i === activeImage}
                          className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                            i === activeImage ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={i === activeImage}
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-200 cursor-pointer ${
                        i === activeImage ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 md:max-h-[80vh] md:overflow-y-auto md:p-8">
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
                {product.inStock ? `In Stock — ${formatStockCount(product.stock)} available` : "Out of Stock"}
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
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#20bd5a] cursor-pointer"
                >
                  <WhatsAppIcon className="h-4 w-4" />
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
