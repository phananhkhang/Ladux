import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useAuthStore, useWishlistStore, useCartStore } from "../lib/store";
import { Button } from "../components/ui/button";
import { fmtUSD, fmtVND, effPrice } from "../lib/utils";
import { toast } from "sonner";

export default function Wishlist() {
  const user = useAuthStore((s) => s.user);
  const items = useWishlistStore((s) => s.items);
  const refresh = useWishlistStore((s) => s.refresh);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const add = useCartStore((s) => s.add);

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  if (!user) {
    return (
      <div className="section-pad py-32 text-center" data-testid="wishlist-empty-auth">
        <h2 className="font-display text-3xl text-white mb-4">Cần đăng nhập</h2>
        <p className="text-zinc-500 mb-6">Đăng nhập để lưu lại các sản phẩm yêu thích.</p>
        <Link to="/login"><Button>Đăng nhập</Button></Link>
      </div>
    );
  }

  return (
    <div className="section-pad py-12 md:py-16" data-testid="wishlist-page">
      <div className="label-eyebrow mb-3">Bộ sưu tập cá nhân</div>
      <h1 className="font-display text-4xl md:text-5xl text-white mb-10 tracking-tight">Yêu thích</h1>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-surface border border-white/5 rounded-3xl">
          <Heart size={36} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 mb-6">Chưa có sản phẩm nào trong wishlist.</p>
          <Link to="/shop"><Button>Khám phá ngay</Button></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((w) => {
            const p = w.product;
            if (!p) return null;
            return (
              <div key={w.id} className="bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-neon/40 transition group" data-testid={`wishlist-item-${p.id}`}>
                <Link to={`/product/${p.slug}`} className="block aspect-[4/3] overflow-hidden">
                  <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </Link>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">{p.brand?.name}</div>
                  <Link to={`/product/${p.slug}`} className="font-display text-white text-lg hover:text-neon transition line-clamp-1">{p.name}</Link>
                  <div className="font-display text-xl text-white mt-2">{fmtUSD(effPrice(p))}</div>
                  <div className="text-xs text-zinc-500">{fmtVND(effPrice(p))}</div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={async () => { try { await add(p.id, 1); toast.success("Đã thêm vào giỏ"); } catch { toast.error("Lỗi"); } }}
                      data-testid={`wishlist-add-cart-${p.id}`}
                    >
                      <ShoppingBag size={14} /> Vào giỏ
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleWish(p.id)} data-testid={`wishlist-remove-${p.id}`}>
                      <Heart size={14} className="fill-neon text-neon" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
