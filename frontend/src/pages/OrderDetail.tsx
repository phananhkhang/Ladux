import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { Orders } from "../api/client";
import { fmtUSD, fmtVND } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import type { OrderResponse, OrderStatus } from "../types/api";

const STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    Orders.byId(Number(id)).then(setOrder);
  }, [id]);

  if (!order) return <div className="section-pad py-32 text-center text-zinc-500" data-testid="order-loading">Đang tải...</div>;

  const stepIdx = Math.max(0, STEPS.indexOf(order.status));

  return (
    <div className="section-pad py-12 md:py-16" data-testid="order-detail-page">
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link to="/orders" className="hover:text-neon">Đơn hàng</Link>
        <span>/</span>
        <span className="text-zinc-300">#AURA-{String(order.id).padStart(5, "0")}</span>
      </div>

      <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
        <div>
          <div className="label-eyebrow mb-3">Mã đơn</div>
          <h1 className="font-display text-3xl md:text-5xl text-white tracking-tight">#AURA-{String(order.id).padStart(5, "0")}</h1>
          <p className="text-zinc-500 text-sm mt-2">Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <Badge variant={order.status === "DELIVERED" ? "solid" : "neon"}>{order.status}</Badge>
      </div>

      {/* Timeline */}
      <div className="bg-surface border border-white/5 rounded-3xl p-6 md:p-8 mb-8" data-testid="order-timeline">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-5 h-px bg-white/10" />
          <div
            className="absolute left-0 top-5 h-px bg-neon transition-all"
            style={{ width: `${(stepIdx / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s, i) => {
            const Icon = [Clock, Check, Truck, CheckCircle2][i];
            const reached = i <= stepIdx;
            return (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                <div className={"h-10 w-10 rounded-full border flex items-center justify-center " + (reached ? "bg-neon text-black border-neon" : "bg-zinc-950 border-white/10 text-zinc-600")}>
                  <Icon size={14} />
                </div>
                <div className={"text-[10px] uppercase tracking-wider " + (reached ? "text-neon" : "text-zinc-600")}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <h3 className="label-eyebrow mb-3">Sản phẩm</h3>
          {order.items?.map((it, i) => (
            <div key={i} className="flex gap-4 items-center bg-surface border border-white/5 rounded-2xl p-4" data-testid={`order-item-${i}`}>
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-black">
                {it.thumbnail ? (
                  <img
                    src={it.thumbnail}
                    alt={it.productName ?? `Product ${it.productId ?? ""}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package size={18} className="text-zinc-700 m-auto h-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white">{it.productName ?? `Product #${it.productId ?? "N/A"}`}</div>
                <div className="text-xs text-zinc-500">× {it.quantity}</div>
              </div>
              <div className="text-white font-display">{fmtUSD(it.priceAtPurchase * it.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="label-eyebrow mb-4">Tổng kết</h3>
            <div className="space-y-2 text-sm">
              <Row k="Tạm tính" v={fmtUSD(order.subTotal)} />
              {order.discountAmount > 0 && <Row k="Giảm giá" v={`- ${fmtUSD(order.discountAmount)}`} vClass="text-neon" />}
              <Row k="Phí ship" v="Miễn phí" />
              <div className="border-t border-white/10 pt-3 flex items-baseline justify-between">
                <span className="text-zinc-300">Thanh toán</span>
                <div className="text-right">
                  <div className="font-display text-2xl text-neon">{fmtUSD(order.finalAmount)}</div>
                  <div className="text-[10px] text-zinc-500">{fmtVND(order.finalAmount)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="label-eyebrow mb-3">Giao đến</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{order.shippingAddress}</p>
            <div className="text-xs text-zinc-500 mt-3">Phương thức: <span className="text-neon">{order.paymentProvider ?? "COD"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, vClass = "text-white" }: { k: string; v: string; vClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400">{k}</span>
      <span className={vClass}>{v}</span>
    </div>
  );
}
