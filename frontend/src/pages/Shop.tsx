import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { Brands, Categories, Products } from "../api/client";
import { Button } from "../components/ui/button";
import type { BrandResponse, CategoryResponse, ProductResponse } from "../types/api";

const SORTS = [
  { v: "newest", l: "Mới nhất" },
  { v: "price_asc", l: "Giá tăng dần" },
  { v: "price_desc", l: "Giá giảm dần" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const brandId = params.get("brand") ? Number(params.get("brand")) : null;
  const catId = params.get("cat") ? Number(params.get("cat")) : null;
  const sort = params.get("sort") || "newest";

  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [cats, setCats] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    Brands.list().then(setBrands).catch(() => setBrands([]));
    Categories.list().then(setCats).catch(() => setCats([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    Products.list({
      page: 0,
      size: 24,
      search: q || undefined,
      brandId: brandId || undefined,
      categoryId: catId || undefined,
      sort,
    })
      .then((d) => { setProducts(d.content || []); setTotal(d.totalElements || 0); })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [q, brandId, catId, sort]);

  const setParam = (k: string, v: string | number | null | undefined) => {
    const next = new URLSearchParams(params);
    if (v === null || v === undefined || v === "") next.delete(k);
    else next.set(k, String(v));
    setParams(next);
  };

  const activeFilters = useMemo(() => {
    const out: Array<{ k: string; l: string }> = [];
    if (q) out.push({ k: "q", l: `“${q}”` });
    if (brandId) {
      const b = brands.find((x) => x.id === brandId);
      if (b) out.push({ k: "brand", l: b.name });
    }
    if (catId) {
      const c = cats.find((x) => x.id === catId);
      if (c) out.push({ k: "cat", l: c.name });
    }
    return out;
  }, [q, brandId, catId, brands, cats]);

  return (
    <div className="section-pad py-12 md:py-16" data-testid="shop-page">
      {/* Hero */}
      <div className="mb-10 md:mb-14">
        <div className="label-eyebrow mb-3">Catalog</div>
        <h1 className="font-display text-4xl md:text-6xl tracking-[-0.03em] text-white text-balance">
          Bộ sưu tập laptop <span className="text-neon">tuyển chọn</span>
        </h1>
        <p className="text-zinc-400 mt-4 max-w-2xl">
          {total} cấu hình hiệu năng cao — từ ultrabook mỏng nhẹ đến cỗ máy gaming RTX 4090.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Filter sidebar (desktop) */}
        <aside className="hidden lg:block lg:col-span-3" data-testid="filter-sidebar">
          <FilterPanel
            brands={brands}
            cats={cats}
            brandId={brandId}
            catId={catId}
            sort={sort}
            setParam={setParam}
          />
        </aside>

        {/* Results */}
        <div className="lg:col-span-9">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilters.map((f) => (
                <button
                  key={f.k}
                  onClick={() => setParam(f.k, "")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs"
                  data-testid={`active-filter-${f.k}`}
                >
                  {f.l} <X size={10} />
                </button>
              ))}
              {activeFilters.length === 0 && (
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{total} kết quả</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/5 border border-white/10 text-sm text-white"
                data-testid="mobile-filter-toggle"
              >
                <SlidersHorizontal size={14} /> Lọc
              </button>
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="h-9 px-4 rounded-full bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-neon"
                data-testid="sort-select"
              >
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v} className="bg-black">{s.l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-surface border border-white/5 rounded-3xl" data-testid="no-results">
              <div className="text-zinc-500 mb-2 font-display text-lg">Không có sản phẩm phù hợp</div>
              <p className="text-zinc-600 text-sm">Hãy thử thay đổi bộ lọc của bạn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="product-grid">
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" data-testid="mobile-filter-drawer">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 inset-x-0 max-h-[85vh] overflow-y-auto bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-white">Bộ lọc</h3>
              <button onClick={() => setDrawerOpen(false)} className="h-9 w-9 rounded-full bg-white/5 inline-flex items-center justify-center"><X size={16} /></button>
            </div>
            <FilterPanel brands={brands} cats={cats} brandId={brandId} catId={catId} sort={sort} setParam={setParam} />
            <Button className="w-full mt-6" onClick={() => setDrawerOpen(false)}>Áp dụng</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface FilterPanelProps {
  brands: BrandResponse[];
  cats: CategoryResponse[];
  brandId: number | null;
  catId: number | null;
  sort?: string;
  setParam: (key: string, value: string | number | null | undefined) => void;
}

function FilterPanel({ brands, cats, brandId, catId, setParam }: FilterPanelProps) {
  return (
    <div className="space-y-8 sticky top-24">
      <FilterGroup title="Brand">
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setParam("brand", brandId === b.id ? "" : b.id)}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium border transition " +
                (brandId === b.id
                  ? "bg-neon text-black border-neon"
                  : "bg-white/5 text-zinc-300 border-white/10 hover:border-neon/40")
              }
              data-testid={`filter-brand-${b.id}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Danh mục">
        <div className="space-y-1">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setParam("cat", catId === c.id ? "" : c.id)}
              className={
                "w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition " +
                (catId === c.id
                  ? "bg-neon/10 text-neon border border-neon/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent")
              }
              data-testid={`filter-cat-${c.id}`}
            >
              <span>{c.name}</span>
              {catId === c.id && <span className="text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label-eyebrow mb-4">{title}</div>
      {children}
    </div>
  );
}
