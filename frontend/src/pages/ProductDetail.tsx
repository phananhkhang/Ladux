import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Cpu, MemoryStick, HardDrive, Monitor, Check, Truck, Shield, RefreshCcw } from "lucide-react";
import { Products, Reviews, getApiErrorMessage } from "../api/client";
import { fmtUSD, fmtVND, effPrice, discountPct, parseSpecs } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuthStore, useCartStore, useUIStore, useWishlistStore } from "../lib/store";
import { toast } from "sonner";
import type { ProductResponse, ReviewResponse } from "../types/api";
import type { LucideIcon } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<ProductResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  // Review form state (full integration)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.isWished);

  useEffect(() => {
    if (!slug) return;
    Products.bySlug(slug)
      .then((d) => {
        setP(d);
        setActiveImg(d.thumbnail);
        Reviews.byProduct(d.id, { page: 0, size: 10 }).then((r) => setReviews(r.content || []));
      })
      .catch((err) => toast.error(getApiErrorMessage(err, "Không tìm thấy sản phẩm")));
  }, [slug]);

  if (!p) {
    return (
      <div className="section-pad py-24" data-testid="product-loading">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-surface rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-surface rounded animate-pulse w-2/3" />
            <div className="h-4 bg-surface rounded animate-pulse w-1/2" />
            <div className="h-32 bg-surface rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const specs = parseSpecs(p.specs);
  const pct = discountPct(p);
  const wished = isWished(p.id);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const handleAdd = async () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate("/login"); return; }
    try {
      await add(p.id, qty);
      toast.success(`Đã thêm ${qty} × ${p.name}`);
      setCartOpen(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err as any, "Không thể thêm"));
    }
  };

  const handleWish = async () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate("/login"); return; }
    await toggleWish(p.id);
  };

  const handleBuyNow = async () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate("/login?redirect=/checkout"); return; }
    await add(p.id, qty);
    navigate("/checkout");
  };

  const submitReview = async () => {
    if (!user) { toast.error("Vui lòng đăng nhập để đánh giá"); navigate("/login"); return; }
    if (!reviewComment.trim()) { toast.error("Vui lòng nhập nội dung đánh giá"); return; }
    if (!p) return;
    setSubmittingReview(true);
    try {
      await Reviews.create({ productId: p.id, rating: reviewRating, comment: reviewComment.trim() });
      toast.success("Cảm ơn bạn đã đánh giá!");
      setReviewComment("");
      setReviewRating(5);
      // refetch reviews
      const r = await Reviews.byProduct(p.id, { page: 0, size: 10 });
      setReviews(r.content || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err as any, "Gửi đánh giá thất bại"));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="section-pad py-12 md:py-16" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
        <Link to="/" className="hover:text-neon">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-neon">Shop</Link>
        <span>/</span>
        <Link to={`/shop?brand=${p.brand?.id}`} className="hover:text-neon">{p.brand?.name}</Link>
        <span>/</span>
        <span className="text-zinc-300 truncate">{p.name}</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-4">
            <motion.div
              key={activeImg}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[5/4] rounded-3xl overflow-hidden bg-surface border border-white/5"
            >
              <div className="absolute inset-0 bg-radial-neon blur-3xl opacity-50" />
              <img src={activeImg ?? p.thumbnail} alt={p.name} className="relative h-full w-full object-cover" />
              {pct > 0 && (
                <div className="absolute top-5 left-5">
                  <Badge variant="solid">-{pct}%</Badge>
                </div>
              )}
            </motion.div>
            <div className="grid grid-cols-4 gap-3">
              {(p.image || []).map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(img.imageUrl)}
                  className={
                    "aspect-square rounded-xl overflow-hidden border transition " +
                    (activeImg === img.imageUrl ? "border-neon ring-neon" : "border-white/10 hover:border-white/30")
                  }
                  data-testid={`thumbnail-${img.id}`}
                >
                  <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="label-eyebrow text-zinc-500">{p.brand?.name}</span>
            <span className="text-zinc-700">•</span>
            <span className="text-xs text-zinc-500 font-mono">{p.sku}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl tracking-[-0.025em] text-white leading-tight mb-4">
            {p.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-0.5 text-neon">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(avg) ? "fill-current" : "opacity-30"} />
              ))}
            </div>
            <span className="text-sm text-zinc-400">{avg.toFixed(1)}</span>
            <span className="text-xs text-zinc-600">({reviews.length} đánh giá)</span>
            {p.stockQuantity > 0 ? (
              <Badge variant="ghost"><Check size={10} /> Còn hàng</Badge>
            ) : (
              <Badge variant="danger">Hết hàng</Badge>
            )}
          </div>

          <div className="flex items-baseline gap-4 mb-8">
            <div className="font-display text-4xl md:text-5xl text-neon" data-testid="product-price">{fmtUSD(effPrice(p))}</div>
            {p.discountPrice && (
              <div className="text-xl text-zinc-500 line-through">{fmtUSD(p.basePrice)}</div>
            )}
          </div>
          <div className="text-xs text-zinc-500 mb-8">≈ {fmtVND(effPrice(p))} · trả góp 0% lên đến 12 tháng</div>

          {/* Spec bento */}
          <div className="grid grid-cols-2 gap-3 mb-10" data-testid="specs-grid">
            <SpecCard icon={Cpu} label="CPU" value={specs.cpu} />
            <SpecCard icon={MemoryStick} label="RAM" value={specs.ram} />
            <SpecCard icon={Monitor} label="GPU" value={specs.gpu} />
            <SpecCard icon={HardDrive} label="Lưu trữ" value={specs.storage} />
            <div className="col-span-2">
              <SpecCard icon={Monitor} label="Màn hình" value={specs.display} />
            </div>
          </div>

          {/* Quantity & CTA */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
            <div className="flex items-center bg-zinc-950 border border-white/10 rounded-full h-14 px-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/5" data-testid="qty-decrement">−</button>
              <div className="w-10 text-center text-white" data-testid="qty-value">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="h-10 w-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/5" data-testid="qty-increment">+</button>
            </div>
            <Button size="lg" onClick={handleAdd} className="flex-1" data-testid="add-to-cart-detail-btn">
              <ShoppingBag size={16} /> Thêm vào giỏ
            </Button>
            <button
              onClick={handleWish}
              className={
                "h-14 w-14 inline-flex items-center justify-center rounded-full border transition shrink-0 " +
                (wished
                  ? "bg-neon/10 border-neon/50 text-neon"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:border-neon/40 hover:text-neon")
              }
              data-testid="wishlist-detail-btn"
            >
              <Heart size={16} className={wished ? "fill-current" : ""} />
            </button>
          </div>
          <Button variant="secondary" size="lg" className="w-full mb-10" onClick={handleBuyNow} data-testid="buy-now-btn">
            Mua ngay
          </Button>

          <div className="grid grid-cols-3 gap-3 pt-8 border-t border-white/5">
            <Promise icon={Truck} title="Giao 24h" body="Nội thành HN/HCM" />
            <Promise icon={Shield} title="BH 36 tháng" body="Chính hãng" />
            <Promise icon={RefreshCcw} title="Đổi 14 ngày" body="Free return" />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24 max-w-4xl mx-auto" data-testid="reviews-section">
        <div className="label-eyebrow mb-3">Đánh giá khách hàng</div>
        <h2 className="font-display text-3xl md:text-4xl text-white mb-10">Sự công nhận từ cộng đồng</h2>

        {/* Submit review form - full FE-BE integration */}
        {user && (
          <div className="mb-8 bg-surface border border-white/5 rounded-2xl p-6">
            <div className="text-sm text-white mb-3">Viết đánh giá của bạn</div>
            <div className="flex items-center gap-2 mb-3">
              {[1,2,3,4,5].map((r) => (
                <button key={r} type="button" onClick={() => setReviewRating(r)} className="text-neon">
                  <Star size={18} className={r <= reviewRating ? "fill-current" : "opacity-30"} />
                </button>
              ))}
              <span className="text-xs text-zinc-500 ml-2">{reviewRating}/5</span>
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Sản phẩm có tốt không? Chia sẻ trải nghiệm..."
              className="w-full min-h-[80px] rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-neon/60"
            />
            <Button onClick={submitReview} disabled={submittingReview || !reviewComment.trim()} className="mt-3">
              {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="bg-surface border border-white/5 rounded-2xl p-6" data-testid={`review-${r.id}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center font-display text-neon">
                    {r.reviewerName?.charAt(0) || "A"}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{r.reviewerName}</div>
                    <div className="text-xs text-zinc-500">Verified buyer</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-neon">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-current" : "opacity-30"} />
                  ))}
                </div>
              </div>
              <p className="text-zinc-400 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SpecCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-4 hover:border-neon/30 transition">
      <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.18em] mb-2">
        <Icon size={12} /> {label}
      </div>
      <div className="text-white text-sm font-medium leading-snug">{value || "—"}</div>
    </div>
  );
}

function Promise({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="text-center">
      <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-2">
        <Icon size={14} className="text-neon" />
      </div>
      <div className="text-xs text-white font-medium">{title}</div>
      <div className="text-[10px] text-zinc-500">{body}</div>
    </div>
  );
}
