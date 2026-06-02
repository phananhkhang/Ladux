import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CreditCard, Truck, Tag, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore, useCartStore } from "../lib/store";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { fmtUSD, fmtVND, effPrice } from "../lib/utils";
import { getApiErrorMessage, Orders } from "../api/client";
import { toast } from "sonner";
import type { PaymentProvider } from "../types/api";
import type { LucideIcon } from "lucide-react";

export default function Checkout() {
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const refresh = useCartStore((s) => s.refresh);
  const subTotal = useCartStore((s) => s.totalPrice);
  const clear = useCartStore((s) => s.clear);
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [name, setName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState("Hà Nội");
  const [payment, setPayment] = useState<PaymentProvider>("COD");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  if (!user) {
    navigate("/login?redirect=/checkout");
    return null;
  }

  // Coupon handled server-side in Order create (no client preview /apply to strictly fit base backend without extra endpoints)
  const discount = 0;
  const total = Math.max(0, subTotal - discount);

  const handleOrder = async () => {
    if (!address || !name || !phone) {
      toast.error("Vui lòng điền đủ thông tin giao hàng");
      return;
    }
    setLoading(true);
    try {
      const order = await Orders.create({
        shippingAddress: `${name} · ${phone} · ${address}, ${city}`,
        paymentProvider: payment,
        couponId: coupon.trim() || null,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      await clear();
      toast.success("Đặt hàng thành công!");
      navigate(`/orders/${order.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Đặt hàng thất bại"));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section-pad py-32 text-center">
        <h2 className="font-display text-3xl text-white mb-4">Giỏ hàng trống</h2>
        <Link to="/shop"><Button>Quay lại cửa hàng</Button></Link>
      </div>
    );
  }

  return (
    <div className="section-pad py-12 md:py-16" data-testid="checkout-page">
      <div className="label-eyebrow mb-3">Thanh toán</div>
      <h1 className="font-display text-4xl md:text-5xl text-white mb-10 tracking-tight">Hoàn tất đơn hàng</h1>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left form */}
        <div className="lg:col-span-7 space-y-10">
          <Section title="Thông tin giao hàng" icon={Truck}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Họ và tên</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required data-testid="checkout-name" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required data-testid="checkout-phone" />
              </div>
              <div className="md:col-span-2">
                <Label>Địa chỉ chi tiết</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, phường..." required data-testid="checkout-address" />
              </div>
              <div>
                <Label>Thành phố</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} data-testid="checkout-city" />
              </div>
            </div>
          </Section>

          <Section title="Phương thức thanh toán" icon={CreditCard}>
            <div className="grid sm:grid-cols-2 gap-3">
              <PaymentOption
                active={payment === "COD"}
                onClick={() => setPayment("COD")}
                title="COD"
                desc="Thanh toán khi nhận hàng"
                testId="payment-cod"
              />
              <PaymentOption
                active={payment === "VNPAY"}
                onClick={() => setPayment("VNPAY")}
                title="VNPAY"
                desc="Visa / Master / ATM nội địa"
                testId="payment-vnpay"
              />
            </div>
          </Section>

          <Section title="Mã giảm giá" icon={Tag}>
            <div className="flex gap-2">
              <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Nhập mã (vd. GIAM10)" data-testid="coupon-input" />
            </div>
            <div className="mt-2 text-xs text-zinc-500">Mã sẽ được backend tự động tính & áp dụng khi đặt hàng (hỗ trợ GIAM10, GIAM15, TRU500... từ DB). Không preview client-side để khớp backend.</div>
          </Section>
        </div>

        {/* Right summary */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-24 bg-surface border border-white/10 rounded-2xl overflow-hidden"
            data-testid="order-summary"
          >
            <div className="p-6 border-b border-white/5">
              <h3 className="font-display text-xl text-white mb-1">Đơn hàng</h3>
              <p className="text-xs text-zinc-500">{items.length} sản phẩm</p>
            </div>
            <div className="p-6 space-y-3 max-h-[300px] overflow-y-auto">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 items-center">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-black shrink-0">
                    <img src={it.product.thumbnail} alt={it.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{it.product.name}</div>
                    <div className="text-xs text-zinc-500">× {it.quantity}</div>
                  </div>
                  <div className="text-sm text-white">{fmtUSD(effPrice(it.product) * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/5 space-y-3 bg-black/40">
              <Row label="Tạm tính" value={fmtUSD(subTotal)} />
              <Row label="Giao hàng" value="Miễn phí" />
              <div className="border-t border-white/10 pt-3 flex items-baseline justify-between">
                <span className="text-zinc-300 font-medium">Tổng cộng</span>
                <div className="text-right">
                  <div className="font-display text-2xl text-neon" data-testid="checkout-total">{fmtUSD(total)}</div>
                  <div className="text-xs text-zinc-500">{fmtVND(total)}</div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 text-center">* Mã giảm giá (nếu có) sẽ được tính bởi backend khi tạo đơn — xem chi tiết ở trang đơn hàng.</div>
              <Button size="lg" className="w-full mt-4" onClick={handleOrder} disabled={loading} data-testid="place-order-btn">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Đặt hàng <ArrowRight size={16} /></>}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-white/5 rounded-2xl p-6 md:p-8">
      <h3 className="flex items-center gap-3 font-display text-xl text-white mb-6">
        <span className="h-9 w-9 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon"><Icon size={14} /></span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function PaymentOption({
  active,
  onClick,
  title,
  desc,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  title: PaymentProvider;
  desc: string;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative text-left p-5 rounded-2xl border transition " +
        (active
          ? "bg-neon/5 border-neon ring-1 ring-neon"
          : "bg-zinc-950 border-white/10 hover:border-white/30")
      }
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-display text-base text-white">{title}</div>
        {active && <Check size={14} className="text-neon" />}
      </div>
      <div className="text-xs text-zinc-500">{desc}</div>
    </button>
  );
}

function Row({ label, value, valueClass = "text-white" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
