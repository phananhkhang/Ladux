import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore, useUIStore, useAuthStore } from "../lib/store";
import { fmtUSD, fmtVND, effPrice } from "../lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUIStore();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.totalPrice);
  const update = useCartStore((s) => s.update);
  const remove = useCartStore((s) => s.remove);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const handleCheckout = () => {
    if (!user) {
      setCartOpen(false);
      toast.error("Vui lòng đăng nhập để thanh toán");
      navigate("/login?redirect=/checkout");
      return;
    }
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#0a0a0a] border-l border-white/10 z-[70] flex flex-col"
            data-testid="cart-drawer"
          >
            <div className="px-6 h-20 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-neon" />
                <h3 className="font-display text-lg text-white">Giỏ hàng</h3>
                <span className="text-xs text-zinc-500">{items.length} sản phẩm</span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-white/5 text-zinc-400 hover:text-white"
                data-testid="cart-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <ShoppingBag size={28} className="text-zinc-600" />
                  </div>
                  <p className="text-zinc-300 mb-2 font-display text-lg">Giỏ hàng trống</p>
                  <p className="text-zinc-500 text-sm mb-6 max-w-xs">
                    Hãy khám phá các kiệt tác công nghệ đang chờ bạn.
                  </p>
                  <Link to="/shop" onClick={() => setCartOpen(false)}>
                    <Button>Khám phá cửa hàng</Button>
                  </Link>
                </div>
              ) : (
                items.map((it) => {
                  const p = it.product;
                  const price = effPrice(p);
                  return (
                    <div
                      key={it.id}
                      className="flex gap-4 bg-zinc-950 border border-white/5 rounded-2xl p-3"
                      data-testid={`cart-item-${p.id}`}
                    >
                      <Link
                        to={`/product/${p.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="h-20 w-20 rounded-xl overflow-hidden bg-black flex-shrink-0"
                      >
                        <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-zinc-500 mb-1">{p.brand?.name}</div>
                        <div className="text-sm text-white font-medium truncate">{p.name}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{fmtVND(price)}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center bg-black border border-white/10 rounded-full">
                            <button
                              onClick={() => update(p.id, Math.max(1, it.quantity - 1))}
                              className="h-8 w-8 inline-flex items-center justify-center text-zinc-400 hover:text-white"
                              data-testid={`cart-decrement-${p.id}`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs text-white w-6 text-center" data-testid={`cart-qty-${p.id}`}>{it.quantity}</span>
                            <button
                              onClick={() => update(p.id, it.quantity + 1)}
                              className="h-8 w-8 inline-flex items-center justify-center text-zinc-400 hover:text-white"
                              data-testid={`cart-increment-${p.id}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(p.id)}
                            className="h-8 w-8 inline-flex items-center justify-center text-zinc-500 hover:text-rose-300"
                            data-testid={`cart-remove-${p.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/10 p-6 space-y-4 bg-black/40">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Tạm tính</div>
                    <div className="text-2xl font-display text-white" data-testid="cart-subtotal">{fmtUSD(total)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">≈</div>
                    <div className="text-sm text-zinc-400">{fmtVND(total)}</div>
                  </div>
                </div>
                <Button onClick={handleCheckout} size="lg" className="w-full" data-testid="cart-checkout-btn">
                  Thanh toán <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
