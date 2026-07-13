import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { Products, Categories } from "@/api/client";
import type { CategoryResponse, ProductResponse } from "@/api/types";
import { resolveMediaUrl } from "@/lib/format";
import { ProductCard } from "../components/product-card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

const FALLBACK_CAT_IMAGE =
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80";

function categoryImageSrc(c: CategoryResponse): string {
  return resolveMediaUrl(c.imageUrl) || FALLBACK_CAT_IMAGE;
}

export function HomePage() {
  const [newArrivals, setNewArrivals] = useState<ProductResponse[]>([]);
  const [onSale, setOnSale] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [productsPage, cats] = await Promise.all([
          Products.listActive({ size: 50, sort: "createdAt,desc" }),
          Categories.rootsAll().catch(() => Categories.listAll()),
        ]);
        if (cancelled) return;
        const items = productsPage.content ?? [];
        setNewArrivals(items.slice(0, 4));
        setOnSale(
          items
            .filter((p) => p.discountPrice != null && Number(p.discountPrice) < Number(p.basePrice))
            .slice(0, 4),
        );
        setCategories((cats ?? []).slice(0, 5));
      } catch {
        if (!cancelled) {
          setNewArrivals([]);
          setOnSale([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-14">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
              New · Latest laptops in stock
            </span>
            <h1 className="text-4xl tracking-tight md:text-5xl" style={{ lineHeight: 1.1 }}>
              The laptop, perfected.
            </h1>
            <p className="max-w-md text-muted-foreground">
              A meticulously curated collection of the world&apos;s finest laptops — gaming rigs,
              ultrabooks, workstations and MacBooks. Nothing else.
            </p>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link to="/products">
                  Shop all laptops <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/products">Browse catalog</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1000&q=80"
              alt="Featured laptop"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: Truck, title: "Free shipping", sub: "On all orders" },
          { icon: ShieldCheck, title: "2-year warranty", sub: "Manufacturer backed" },
          { icon: RefreshCw, title: "30-day returns", sub: "No questions asked" },
          { icon: Headphones, title: "Expert support", sub: "7 days a week" },
        ].map((f) => (
          <div key={f.title} className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <f.icon size={22} className="text-muted-foreground" />
            <div>
              <p className="text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2>Shop by category</h2>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?categoryId=${c.id}`}
                className="group relative overflow-hidden rounded-lg border"
              >
                <ImageWithFallback
                  src={categoryImageSrc(c)}
                  alt={c.name}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 text-sm text-white">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2>New arrivals</h2>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet. Start the backend to load catalog.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* On sale */}
      {onSale.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2>On sale</h2>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {onSale.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
