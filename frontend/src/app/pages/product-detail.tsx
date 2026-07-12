import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Heart, Minus, Plus, ShoppingCart, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Products, Reviews, getApiErrorMessage } from "@/api/client";
import type { ProductResponse, ReviewResponse } from "@/api/types";
import {
  formatPrice,
  productDiscountPercent,
  productImages,
  shortSpecFromSpecs,
} from "@/lib/format";
import { useStore } from "../data/store";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ProductCard } from "../components/product-card";
import { RatingStars, StockBadge } from "../components/shared";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, isAuthenticated } = useStore();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [related, setRelated] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const p = await Products.bySlug(slug);
        if (cancelled) return;
        setProduct(p);
        setActiveImg(0);
        setQty(1);

        const [rev, rel] = await Promise.all([
          Reviews.byProduct(p.id, { size: 20 }).catch(() => null),
          p.category
            ? Products.byCategory(p.category.id, { size: 8 }).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setReviews(rev?.content ?? []);
        setRelated(
          (rel?.content ?? []).filter((x) => x.id !== p.id).slice(0, 4),
        );
      } catch {
        if (!cancelled) {
          setProduct(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="py-24 text-center">
        <h2>Product not found</h2>
        <Button asChild className="mt-4">
          <Link to="/products">Back to shop</Link>
        </Button>
      </div>
    );
  }

  let specs: Record<string, string> = {};
  try {
    specs = product.specs ? (JSON.parse(product.specs) as Record<string, string>) : {};
  } catch {
    specs = {};
  }

  const images = productImages(product);
  const price = Number(product.discountPrice ?? product.basePrice);
  const pct = productDiscountPercent(product);
  const soldOut = product.stockQuantity <= 0;
  const wishlisted = isWishlisted(product.id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const requireAuth = async (fn: () => Promise<void>, ok: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      navigate(
        `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
      return;
    }
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-14">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={16} /> Back to laptops
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border bg-muted">
            <ImageWithFallback
              src={images[activeImg]}
              alt={product.name}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-lg border-2 ${
                    i === activeImg ? "border-primary" : "border-transparent"
                  }`}
                >
                  <ImageWithFallback src={img} alt="" className="size-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">
              {product.brand?.name ?? "—"} · {product.category?.name ?? "—"}
            </p>
            <h1 className="mt-1 tracking-tight">{product.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p>
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars value={avgRating} size={16} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {reviews.length} reviews
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-3xl tabular-nums">{formatPrice(price)}</span>
            {product.discountPrice != null && (
              <>
                <span className="text-lg text-muted-foreground line-through tabular-nums">
                  {formatPrice(Number(product.basePrice))}
                </span>
                {pct != null && (
                  <span className="rounded-md bg-primary px-2 py-0.5 text-sm text-primary-foreground">
                    -{pct}%
                  </span>
                )}
              </>
            )}
          </div>

          <StockBadge quantity={product.stockQuantity} />
          <p className="text-muted-foreground">
            {shortSpecFromSpecs(product.specs) || "Premium laptop from our catalog."}
          </p>
          <Separator />

          <div className="flex items-center gap-4">
            <span className="text-sm">Quantity</span>
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-r-none"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </Button>
              <span className="w-12 text-center text-sm tabular-nums">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-l-none"
                disabled={qty >= product.stockQuantity}
                onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={soldOut || busy}
              onClick={() =>
                requireAuth(
                  () => addToCart(product.id, qty),
                  `Added ${qty} × ${product.name} to cart`,
                )
              }
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : <ShoppingCart size={16} />}
              {soldOut ? "Hết hàng" : "Add to cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={busy}
              onClick={() =>
                requireAuth(
                  () => toggleWishlist(product.id),
                  wishlisted ? "Removed from wishlist" : "Added to wishlist",
                )
              }
            >
              <Heart
                size={16}
                className={wishlisted ? "fill-red-500 text-red-500" : undefined}
              />
              Wishlist
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="specs">
        <TabsList>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-4">
          {Object.keys(specs).length === 0 ? (
            <p className="text-sm text-muted-foreground">No specifications listed.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(specs).map(([k, v], i) => (
                    <tr key={k} className={i % 2 === 0 ? "bg-muted/40" : ""}>
                      <td className="w-1/3 px-4 py-2.5 text-muted-foreground">{k}</td>
                      <td className="px-4 py-2.5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="mt-4 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm">{r.reviewerName}</p>
                    <RatingStars value={r.rating} size={12} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section>
          <h2 className="mb-4">Related products</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
