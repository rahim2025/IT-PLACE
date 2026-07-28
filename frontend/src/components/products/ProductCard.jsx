import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import StarRating from "./StarRating";
import ProductBadge from "./ProductBadge";
import { formatPrice } from "../../utils/format";

export default function ProductCard({ product, isWishlisted, onToggleWishlist, onQuickView }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <ProductBadge variant="new">New</ProductBadge>}
          {product.compareAtPrice && <ProductBadge variant="sale">Sale</ProductBadge>}
          {product.isBestSeller && <ProductBadge variant="bestseller">Bestseller</ProductBadge>}
        </div>

        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-secondary shadow-sm backdrop-blur-sm transition-colors duration-200 hover:bg-white cursor-pointer"
        >
          <Heart size={18} className={isWishlisted ? "fill-destructive text-destructive" : ""} />
        </button>

        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-full bg-primary/95 px-4 py-2.5 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer"
        >
          <Eye size={16} />
          Quick View
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          <span>{product.category}</span>
          <span>{product.brand}</span>
        </div>

        <h3 className="mt-1.5 text-sm font-bold leading-snug text-primary">{product.name}</h3>

        <div className="mt-2">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <p
          className={`mt-1.5 text-xs font-semibold ${
            product.inStock ? "text-success" : "text-destructive"
          }`}
        >
          {product.inStock ? `In Stock (${product.stock})` : "Out of Stock"}
        </p>

        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-muted cursor-pointer"
        >
          View Details
        </button>
      </div>
    </motion.article>
  );
}
