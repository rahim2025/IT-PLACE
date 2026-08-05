import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/products/ProductCard";
import ProductCardSkeleton from "../components/products/ProductCardSkeleton";
import QuickViewModal from "../components/products/QuickViewModal";
import { useWishlist } from "../hooks/useWishlist";
import { api } from "../utils/api";

export default function WishlistPage() {
  const { wishlistIds, isWishlisted, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (wishlistIds.length === 0) {
      setProducts([]);
      setStatus("success");
      return undefined;
    }
    setStatus("loading");
    Promise.all(
      wishlistIds.map((id) =>
        api
          .get(`/products/${id}`)
          .then((data) => data.product)
          .catch(() => null)
      )
    ).then((fetched) => {
      if (cancelled) return;
      setProducts(fetched.filter(Boolean));
      setStatus("success");
    });
    return () => {
      cancelled = true;
    };
  }, [wishlistIds]);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading eyebrow="Account" title="My Wishlist" align="left" />

        <div className="mt-10">
          {status === "loading" ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Heart size={28} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-primary">Your wishlist is empty</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Save products you're interested in by tapping the heart icon on any product card.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={isWishlisted(product.id)}
                  onToggleWishlist={toggleWishlist}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
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
