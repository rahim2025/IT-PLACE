import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FolderSearch, ServerCrash } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/products/ProductCard";
import ProductCardSkeleton from "../components/products/ProductCardSkeleton";
import QuickViewModal from "../components/products/QuickViewModal";
import SeoHead from "../seo/SeoHead";
import { buildCollectionPageSchema, buildBreadcrumbSchema } from "../seo/schema";
import { absoluteUrl, SITE_NAME } from "../seo/config";
import { useWishlist } from "../hooks/useWishlist";
import { api } from "../utils/api";
import { getCached, setCached } from "../utils/pageCache";

const SKELETON_COUNT = 8;
const cacheKey = (slug) => `brand:${slug}`;

export default function BrandPage() {
  const { slug } = useParams();
  const initialCache = getCached(cacheKey(slug));
  const [status, setStatus] = useState(initialCache ? "success" : "loading");
  const [retryToken, setRetryToken] = useState(0);
  const [brand, setBrand] = useState(initialCache?.brand ?? null);
  const [products, setProducts] = useState(initialCache?.products ?? []);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    let cancelled = false;
    const key = cacheKey(slug);
    const existing = getCached(key);
    if (existing) {
      setBrand(existing.brand);
      setProducts(existing.products);
      setStatus("success");
    } else {
      setStatus("loading");
    }
    api
      .get(`/brands/slug/${slug}`)
      .then((data) => {
        if (cancelled) return;
        const result = { brand: data.brand, products: (data.products || []).filter((p) => p.status === "active") };
        setCached(key, result);
        setBrand(result.brand);
        setProducts(result.products);
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        if (!existing) setStatus(err?.status === 404 ? "not-found" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, retryToken]);

  const seoTitle = brand ? brand.seo?.title || `${brand.name} Products | ${SITE_NAME}` : "";
  const seoDescription = brand
    ? brand.seo?.description || brand.description || `Browse ${brand.name} products at ${SITE_NAME}, Saudi Arabia.`
    : "";
  const canonical = brand ? brand.seo?.canonicalUrl || absoluteUrl(`/brands/${brand.slug}`) : "";

  return (
    <section className="bg-background py-10 md:py-16">
      {status === "success" && brand && (
        <SeoHead
          title={seoTitle}
          description={seoDescription}
          keywords={brand.seo?.keywords?.length ? brand.seo.keywords : [brand.name]}
          canonical={canonical}
          ogImage={brand.seo?.ogImage || brand.logo}
          socialTitle={brand.seo?.socialTitle}
          socialDescription={brand.seo?.socialDescription}
          jsonLd={[
            buildCollectionPageSchema({ name: `${brand.name} Products`, description: seoDescription, url: canonical }),
            buildBreadcrumbSchema([{ name: brand.name, url: canonical }]),
          ]}
        />
      )}
      {status === "not-found" && <SeoHead title={`Brand Not Found | ${SITE_NAME}`} robots="noindex, follow" />}

      <div className="container-app">
        {status === "success" && brand && (
          <Breadcrumbs items={[{ label: "Products", to: "/products" }, { label: brand.name }]} />
        )}

        <div className="mt-6">
          {status === "not-found" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderSearch size={28} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-lg font-bold text-primary">Brand not found</h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                This brand may have been removed or renamed.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
              >
                Browse All Products
              </Link>
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ServerCrash size={28} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-lg font-bold text-primary">Couldn't load this brand</h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Something went wrong. Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => setRetryToken((t) => t + 1)}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {status === "loading" ? (
                <div className="max-w-2xl">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-9 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="mt-4 h-4 w-full animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  {brand.logo && (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-3">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        loading="eager"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <SectionHeading
                    as="h1"
                    eyebrow="Brand"
                    title={brand.name}
                    description={brand.description || `Browse our full range of ${brand.name} products.`}
                    align="left"
                  />
                </div>
              )}

              {status !== "loading" && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{products.length}</span> product
                  {products.length === 1 ? "" : "s"} from {brand.name}
                </p>
              )}

              <div className="mt-8">
                {status === "loading" ? (
                  <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                    <p className="text-sm text-muted-foreground">No products from this brand yet — check back soon.</p>
                  </div>
                ) : (
                  <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={isWishlisted(product.id)}
                          onToggleWishlist={toggleWishlist}
                          onQuickView={setQuickViewProduct}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
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
