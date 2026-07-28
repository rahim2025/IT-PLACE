import { Star } from "lucide-react";

export default function StarRating({ rating, reviewCount, size = 14 }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Rated ${rating} out of 5 stars`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-amber-400 text-amber-400" : "fill-none text-border"}
              aria-hidden="true"
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" && ` (${reviewCount})`}
      </span>
    </div>
  );
}
