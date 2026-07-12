import { Link, useNavigate } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { ProductResponse } from "@/api/types";
import { formatPrice, productDiscountPercent, productImages, shortSpecFromSpecs } from "@/lib/format";
import { useStore, getApiErrorMessage } from "../data/store";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { StockBadge } from "./shared";

export function ProductCard({
  product,
  compact = false,
}: {
  product: ProductResponse;
  compact?: boolean;
}) {
  const { toggleWishlist, isWishlisted, addToCart, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const pct = productDiscountPercent(product);
  const price = Number(product.discountPrice ?? product.basePrice);
  const soldOut = product.stockQuantity <= 0;
  const wishlisted = isWishlisted(product.id);
  const images = productImages(product);
  const shortSpec = shortSpecFromSpecs(product.specs);

  const requireAuth = (action: () => Promise<void>, successMsg: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      navigate("/login");
      return;
    }
    void action()
      .then(() => toast.success(successMsg))
      .catch((e) => toast.error(getApiErrorMessage(e)));
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {pct != null && pct > 0 && (
          <span className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            -{pct}%
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() =>
          requireAuth(
            () => toggleWishlist(product.id),
            wishlisted ? "Removed from wishlist" : "Added to wishlist",
          )
        }
        aria-label="Toggle wishlist"
        className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
      >
        <Heart
          size={16}
          className={wishlisted ? "fill-red-500 text-red-500" : "text-foreground"}
        />
      </button>

      <Link to={`/products/${product.slug}`} className="block overflow-hidden bg-muted">
        <ImageWithFallback
          src={images[0]}
          alt={product.name}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{product.brand?.name ?? "—"}</span>
          <StockBadge quantity={product.stockQuantity} />
        </div>
        <Link to={`/products/${product.slug}`}>
          <h3 className="line-clamp-1">{product.name}</h3>
        </Link>
        {!compact && shortSpec && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{shortSpec}</p>
        )}
        <div className="mt-auto flex items-end gap-2 pt-1">
          <span className="text-base tabular-nums">{formatPrice(price)}</span>
          {product.discountPrice != null && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {formatPrice(Number(product.basePrice))}
            </span>
          )}
        </div>
        <Button
          className="mt-2 w-full"
          size="sm"
          disabled={soldOut}
          onClick={() =>
            requireAuth(() => addToCart(product.id, 1), `Added ${product.name} to cart`)
          }
        >
          <ShoppingCart size={16} />
          {soldOut ? "Hết hàng" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
