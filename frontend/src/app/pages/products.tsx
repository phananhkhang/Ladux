import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { SlidersHorizontal, PackageX } from "lucide-react";
import { Products, Brands, Categories } from "@/api/client";
import type { BrandResponse, CategoryResponse, ProductResponse } from "@/api/types";
import { productDiscountPercent } from "@/lib/format";
import { ProductCard } from "../components/product-card";
import { PageShell } from "../components/storefront-layout";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function ProductsPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const categoryIdParam = params.get("categoryId");
  const categoryNameParam = params.get("category");

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [allBrands, setAllBrands] = useState<BrandResponse[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryResponse[]>([]);
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>(
    categoryIdParam ? [Number(categoryIdParam)] : [],
  );
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (categoryIdParam) setCategoryIds([Number(categoryIdParam)]);
  }, [categoryIdParam]);

  // Resolve category name query → id once categories load
  useEffect(() => {
    if (!categoryNameParam || !allCategories.length) return;
    const hit = allCategories.find(
      (c) => c.name.toLowerCase() === categoryNameParam.toLowerCase(),
    );
    if (hit) setCategoryIds([hit.id]);
  }, [categoryNameParam, allCategories]);

  useEffect(() => {
    // Backend returns Spring Page — must use .content / listAll, not raw list as array
    void Brands.listAll()
      .then(setAllBrands)
      .catch(() => setAllBrands([]));
    void Categories.listAll()
      .then(setAllCategories)
      .catch(() => setAllCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let list: ProductResponse[] = [];
        let totalElements = 0;
        let last = true;
        const multiFilter =
          brandIds.length + categoryIds.length > 1 ||
          (brandIds.length > 0 && categoryIds.length > 0);

        if (categoryIds.length === 1 && brandIds.length === 0 && !q) {
          const res = await Products.byCategory(categoryIds[0], {
            page,
            size: 12,
            sort: sortParam(sort),
          });
          list = res.content ?? [];
          totalElements = res.totalElements ?? 0;
          last = !!res.last;
        } else if (brandIds.length === 1 && categoryIds.length === 0 && !q) {
          const res = await Products.byBrand(brandIds[0], {
            page,
            size: 12,
            sort: sortParam(sort),
          });
          list = res.content ?? [];
          totalElements = res.totalElements ?? 0;
          last = !!res.last;
        } else if (multiFilter) {
          const big = await Products.list({
            page: 0,
            size: 50,
            search: q || undefined,
            sort: sortParam(sort),
          });
          let items = [...(big.content ?? [])];
          if (brandIds.length) {
            items = items.filter((p) => p.brand && brandIds.includes(p.brand.id));
          }
          if (categoryIds.length) {
            items = items.filter((p) => p.category && categoryIds.includes(p.category.id));
          }
          items = sortClient(items, sort);
          totalElements = items.length;
          const end = (page + 1) * 12;
          list = items.slice(0, end);
          last = end >= items.length;
        } else {
          // Default: all products with server pagination
          const res = await Products.list({
            page,
            size: 12,
            search: q || undefined,
            sort: sortParam(sort),
          });
          list = res.content ?? [];
          totalElements = res.totalElements ?? 0;
          last = !!res.last;
        }

        if (cancelled) return;
        setProducts(Array.isArray(list) ? list : []);
        setTotal(totalElements);
        setHasMore(!last);
      } catch (err) {
        console.error("Failed to load products", err);
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, brandIds, categoryIds, sort, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [q, brandIds, categoryIds, sort]);

  const toggleId = (id: number, list: number[], setter: (v: number[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  return (
    <PageShell
      title={q ? `Search: "${q}"` : "All laptops"}
      subtitle={`${total} products`}
      action={
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-48">
            <SlidersHorizontal size={14} className="mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="discount">Biggest discount</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <FilterGroup title="Category">
            {allCategories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={categoryIds.includes(c.id)}
                  onCheckedChange={() => toggleId(c.id, categoryIds, setCategoryIds)}
                />
                <span className="line-clamp-1">{c.name}</span>
              </label>
            ))}
            {allCategories.length === 0 && (
              <p className="text-xs text-muted-foreground">No categories</p>
            )}
          </FilterGroup>
          <FilterGroup title="Brand">
            {allBrands.map((b) => (
              <label key={b.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={brandIds.includes(b.id)}
                  onCheckedChange={() => toggleId(b.id, brandIds, setBrandIds)}
                />
                {b.name}
              </label>
            ))}
            {allBrands.length === 0 && (
              <p className="text-xs text-muted-foreground">No brands</p>
            )}
          </FilterGroup>
          {(brandIds.length > 0 || categoryIds.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setBrandIds([]);
                setCategoryIds([]);
              }}
            >
              Clear filters
            </Button>
          )}
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
              <PackageX size={40} className="mb-4 text-muted-foreground" />
              <h3>No products found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting filters or search terms.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-3 block text-sm">{title}</Label>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function sortParam(sort: string): string | undefined {
  switch (sort) {
    case "price-asc":
      return "basePrice,asc";
    case "price-desc":
      return "basePrice,desc";
    case "name":
      return "name,asc";
    case "newest":
      return "createdAt,desc";
    default:
      return "createdAt,desc";
  }
}

function sortClient(list: ProductResponse[], sort: string): ProductResponse[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort(
        (a, b) =>
          Number(a.discountPrice ?? a.basePrice) - Number(b.discountPrice ?? b.basePrice),
      );
    case "price-desc":
      return arr.sort(
        (a, b) =>
          Number(b.discountPrice ?? b.basePrice) - Number(a.discountPrice ?? a.basePrice),
      );
    case "discount":
      return arr.sort(
        (a, b) => (productDiscountPercent(b) ?? 0) - (productDiscountPercent(a) ?? 0),
      );
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr;
  }
}
