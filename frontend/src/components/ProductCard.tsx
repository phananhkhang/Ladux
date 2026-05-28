import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ChevronRight } from "lucide-react";
import { fmtUSD, fmtVND, effPrice, discountPct, parseSpecs } from "../lib/utils";
import { Badge } from "./ui/badge";
import { useCartStore, useWishlistStore, useAuthStore } from "../lib/store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { ProductResponse } from "../types/api";

interface ProductCardProps {
  p: ProductResponse;
  featured?: boolean;
}

export default function ProductCard({ p, featured = false }: ProductCardProps) {
  const add = useCartStore((s) => s.add);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.isWished)(p.id);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const specs = parseSpecs(p.specs);
  const pct = discountPct(p);

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate("/login"); return; }
    try {
      await add(p.id, 1);
      toast.success(`Đã thêm ${p.name}`);
    } catch {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  const handleWish = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate("/login"); return; }
    try {
      await toggleWish(p.id);
    } catch {
      toast.error("Lỗi");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={featured ? "md:col-span-2 md:row-span-2" : ""}
    >
      <Link
        to={`/product/${p.slug}`}
        className="group relative block bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(0,255,102,0.35)] h-full"
        data-testid={`product-card-${p.id}`}
      >
        {/* image */}
        <div className={`relative overflow-hidden bg-black ${featured ? "aspect-[16/12]" : "aspect-[4/3]"}`}>
          <img
            src={p.thumbnail}
            alt={p.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="shine-overlay" />

          {/* badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {pct > 0 && <Badge variant="solid">-{pct}%</Badge>}
            {p.stockQuantity > 0 && p.stockQuantity < 20 && (
              <Badge variant="danger">Còn {p.stockQuantity}</Badge>
            )}
          </div>

          {/* wishlist */}
          <button
            onClick={handleWish}
            className={
              "absolute top-3 right-3 h-9 w-9 inline-flex items-center justify-center rounded-full backdrop-blur-md border transition " +
              (isWished
                ? "bg-neon/15 border-neon/50 text-neon"
                : "bg-black/40 border-white/10 text-zinc-300 hover:text-neon hover:border-neon/40")
            }
            aria-label="Wishlist"
            data-testid={`wishlist-btn-${p.id}`}
          >
            <Heart size={14} className={isWished ? "fill-current" : ""} />
          </button>
        </div>

        {/* content */}
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{p.brand?.name}</span>
            <span className="text-[10px] text-zinc-600">{p.sku}</span>
          </div>
          <h3 className="font-display text-lg md:text-xl text-white tracking-tight leading-snug line-clamp-2 mb-3">
            {p.name}
          </h3>

          <div className="hidden md:flex flex-wrap gap-1.5 mb-4">
            {specs.cpu && <SpecChip>{specs.cpu.split(" ").slice(0, 3).join(" ")}</SpecChip>}
            {specs.ram && <SpecChip>{specs.ram}</SpecChip>}
            {specs.gpu && <SpecChip>{specs.gpu.split(" ").slice(0, 3).join(" ")}</SpecChip>}
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-display text-xl md:text-2xl text-white">{fmtUSD(effPrice(p))}</div>
              <div className="flex items-baseline gap-2">
                {p.discountPrice && (
                  <span className="text-xs text-zinc-500 line-through">{fmtUSD(p.basePrice)}</span>
                )}
                <span className="text-[11px] text-zinc-600">≈ {fmtVND(effPrice(p))}</span>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-neon text-black hover:bg-neon-hover hover:scale-105 transition shadow-[0_0_20px_-6px_rgba(0,255,102,0.6)]"
              data-testid={`add-to-cart-${p.id}`}
              aria-label="Thêm vào giỏ"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SpecChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-mono">
      {children}
    </span>
  );
}
