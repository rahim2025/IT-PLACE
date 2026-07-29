import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, PackageSearch, ServerCrash } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import StarRating from "../components/products/StarRating";
import ProductBadge from "../components/products/ProductBadge";
import ProductCard from "../components/products/ProductCard";
import QuickViewModal from "../components/products/QuickViewModal";
import WhatsAppIcon from "../components/WhatsAppIcon";
import SectionHeading from "../components/SectionHeading";
import SeoHead from "../seo/SeoHead";
import { buildProductSchema, buildBreadcrumbSchema } from "../seo/schema";
import { absoluteUrl, SITE_NAME } from "../seo/config";
import { formatPrice } from "../utils/format";
import { business } from "../data/content";
import { useWishlist } from "../hooks/useWishlist";
import { api } from "../utils/api";
import { slugify } from "../utils/slugify";

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
      <div className="space-y-4">
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PackageSearch size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-lg font-bold text-primary">Product not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        This product may have been removed or is no longer available.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
      >
        Browse All Products
      </Link>
    </div>
  );
}

function ProductLoadError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ServerCrash size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-lg font-bold text-primary">Couldn't load this product</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Something went wrong. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [status, setStatus] = useState("loading");
  const [retryToken, setRetryToken] = useState(0);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setActiveImage(0);
    api
      .get(`/products/slug/${slug}`)
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
        setRelated(data.related || []);
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err?.status === 404 ? "not-found" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, retryToken]);

  const images = product?.images?.length ? product.images : product ? [product.image] : [];
  const showPrev = () => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  const quoteMessage = product
    ? encodeURIComponent(`Hi ITPlace, I'd like more information about: ${product.name} (${product.sku})`)
    : "";

  const seoTitle = product ? product.seo?.title || `${product.name} | ${product.category} | ${product.brand} | ${SITE_NAME}` : "";
  const seoDescription = product
    ? product.seo?.description ||
      (product.description ? product.description.slice(0, 160) : "") ||
      `Shop ${product.name} from ${product.brand} in the ${product.category} category at ${SITE_NAME}, Saudi Arabia.`
    : "";
  const canonical = product ? product.seo?.canonicalUrl || absoluteUrl(`/products/${product.slug}`) : "";

  return (
    <section className="bg-background py-10 md:py-16">
      {status === "success" && product && (
        <SeoHead
          title={seoTitle}
          description={seoDescription}
          keywords={product.seo?.keywords?.length ? product.seo.keywords : [product.name, product.brand, product.category]}
          canonical={canonical}
          ogType="product"
          ogImage={product.seo?.ogImage || product.image}
          socialTitle={product.seo?.socialTitle}
          socialDescription={product.seo?.socialDescription}
          jsonLd={[
            buildProductSchema(product),
            buildBreadcrumbSchema([
              { name: product.category, url: absoluteUrl(`/categories/${product.categoryId}`) },
              { name: product.name, url: canonical },
            ]),
          ]}
        />
      )}
      {status === "not-found" && <SeoHead title={`Product Not Found | ${SITE_NAME}`} robots="noindex, follow" />}

      <div className="container-app">
        {status === "success" && product && (
          <Breadcrumbs
            items={[
              { label: product.category, to: `/categories/${product.categoryId}` },
              { label: product.name },
            ]}
          />
        )}

        <div className="mt-6">
          {status === "loading" ? (
            <ProductDetailSkeleton />
          ) : status === "not-found" ? (
            <ProductNotFound />
          ) : status === "error" ? (
            <ProductLoadError onRetry={() => setRetryToken((t) => t + 1)} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                    <motion.img
                      key={activeImage}
                      src={images[activeImage]}
                      alt={`${product.name} — ${product.brand} ${product.category}, image ${activeImage + 1} of ${images.length}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      width={800}
                      height={800}
                      className="h-full w-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={showPrev}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-200 hover:bg-black/70 cursor-pointer"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={showNext}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-200 hover:bg-black/70 cursor-pointer"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, i) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          aria-label={`Show image ${i + 1}`}
                          aria-current={i === activeImage}
                          className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-200 cursor-pointer ${
                            i === activeImage ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} thumbnail ${i + 1}`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {product.isNew && <ProductBadge variant="new">New</ProductBadge>}
                    {product.compareAtPrice && <ProductBadge variant="sale">Sale</ProductBadge>}
                    {product.isBestSeller && <ProductBadge variant="bestseller">Bestseller</ProductBadge>}
                  </div>

                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    <Link to={`/categories/${product.categoryId}`} className="hover:text-accent">
                      {product.category}
                    </Link>
                    {" • "}
                    <Link to={`/brands/${slugify(product.brand)}`} className="hover:text-accent">
                      {product.brand}
                    </Link>
                    {` • SKU ${product.sku}`}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-primary md:text-3xl">{product.name}</h1>

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

                  {product.description && (
                    <p className="mt-4 text-sm leading-relaxed text-secondary">{product.description}</p>
                  )}

                  {product.colors.length > 0 && (
                    <div className="mt-4">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</h2>
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
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size</h2>
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
                      onClick={() => toggleWishlist(product.id)}
                      aria-pressed={isWishlisted(product.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-secondary transition-colors duration-200 hover:bg-muted cursor-pointer"
                    >
                      <Heart size={16} className={isWishlisted(product.id) ? "fill-destructive text-destructive" : ""} />
                      {isWishlisted(product.id) ? "Wishlisted" : "Add to Wishlist"}
                    </button>
                  </div>
                </div>
              </div>

              {related.length > 0 && (
                <div className="mt-16 md:mt-24">
                  <SectionHeading eyebrow="You May Also Like" title="Related Products" align="left" />
                  <motion.div layout className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                      {related.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          isWishlisted={isWishlisted(p.id)}
                          onToggleWishlist={toggleWishlist}
                          onQuickView={setQuickViewProduct}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
        onToggleWishlist={toggleWishlist}
      />
    </section>
  );
}
