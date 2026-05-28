import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import { useAuthStore } from "../lib/store";
import { Orders } from "../api/client";
import { Button } from "../components/ui/button";
import { Badge, type BadgeVariant } from "../components/ui/badge";
import { fmtUSD } from "../lib/utils";
import type { OrderResponse, OrderStatus } from "../types/api";

const STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING: "ghost",
  CONFIRMED: "neon",
  SHIPPED: "neon",
  DELIVERED: "solid",
  CANCELLED: "danger",
};

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Orders.mine({ page: 0, size: 30 })
      .then((d) => setOrders(d.content || []))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="section-pad py-32 text-center">
        <h2 className="font-display text-3xl text-white mb-4">Cần đăng nhập</h2>
        <Link to="/login"><Button>Đăng nhập</Button></Link>
      </div>
    );
  }

  return (
    <div className="section-pad py-12 md:py-16" data-testid="orders-page">
      <div className="label-eyebrow mb-3">Lịch sử</div>
      <h1 className="font-display text-4xl md:text-5xl text-white mb-10 tracking-tight">Đơn hàng của tôi</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-surface border border-white/5 rounded-3xl">
          <Package size={36} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 mb-6">Chưa có đơn hàng nào.</p>
          <Link to="/shop"><Button>Mua sắm ngay</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="block bg-surface border border-white/5 rounded-2xl p-5 md:p-6 hover:border-neon/40 transition"
              data-testid={`order-row-${o.id}`}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                    <Package size={16} />
                  </div>
                  <div>
                    <div className="font-display text-white text-lg">#AURA-{String(o.id).padStart(5, "0")}</div>
                    <div className="text-xs text-zinc-500">{new Date(o.createdAt).toLocaleString("vi-VN")} · {o.items?.length || 0} sản phẩm</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={STATUS_VARIANT[o.status] || "ghost"}>{o.status}</Badge>
                  <div className="text-right">
                    <div className="font-display text-lg text-white">{fmtUSD(o.finalAmount)}</div>
                    <div className="text-xs text-zinc-500">{o.paymentProvider ?? "COD"}</div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
