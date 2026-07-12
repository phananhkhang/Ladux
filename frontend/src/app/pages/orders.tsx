import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Check, PackageX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Orders, Products, getApiErrorMessage } from "@/api/client";
import type { OrderResponse, OrderStatus, ProductResponse } from "@/api/types";
import { formatPrice, formatDate, productImages } from "@/lib/format";
import { useStore } from "../data/store";
import { PageShell } from "../components/storefront-layout";
import { OrderStatusBadge } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

const STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return <p className="text-sm text-destructive">This order was cancelled.</p>;
  }
  const current = STEPS.indexOf(status);
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs ${
                i <= current
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background text-muted-foreground"
              }`}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className="text-[10px] text-muted-foreground">{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 ${i < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function OrdersPage() {
  const { isAuthenticated, authLoading } = useStore();
  const [tab, setTab] = useState("ALL");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [productMap, setProductMap] = useState<Record<number, ProductResponse>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const page = await Orders.mine({ size: 50, sort: "createdAt,desc" });
        if (cancelled) return;
        const list = page.content ?? [];
        setOrders(list);

        const ids = new Set<number>();
        list.forEach((o) => o.orderItems?.forEach((i) => ids.add(i.productId)));
        const entries = await Promise.all(
          [...ids].map(async (id) => {
            try {
              return [id, await Products.byId(id)] as const;
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        const map: Record<number, ProductResponse> = {};
        entries.forEach((e) => {
          if (e) map[e[0]] = e[1];
        });
        setProductMap(map);
      } catch (e) {
        if (!cancelled) {
          setOrders([]);
          toast.error(getApiErrorMessage(e, "Failed to load orders"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-24 text-center">
        <h3>Sign in to view orders</h3>
        <Button asChild className="mt-4">
          <Link to="/login?redirect=/orders">Sign in</Link>
        </Button>
      </div>
    );
  }

  const filtered = tab === "ALL" ? orders : orders.filter((o) => o.status === tab);

  return (
    <PageShell title="My orders">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="ALL">All</TabsTrigger>
          {STEPS.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s}
            </TabsTrigger>
          ))}
          <TabsTrigger value="CANCELLED">CANCELLED</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
          <PackageX size={40} className="mb-4 text-muted-foreground" />
          <h3>No orders here</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders with this status will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} productMap={productMap} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function OrderCard({
  order,
  productMap,
}: {
  order: OrderResponse;
  productMap: Record<number, ProductResponse>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Order #{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(order.createdAt)} · {order.paymentProvider ?? "—"} ·{" "}
            {formatPrice(Number(order.finalAmount))}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Details"}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t p-4">
          <OrderStepper status={order.status} />
          <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
          {order.trackingNumber && (
            <p className="text-sm">
              Tracking: <b>{order.trackingNumber}</b>
            </p>
          )}
          <Separator />
          <div className="space-y-3">
            {(order.orderItems ?? []).map((item) => {
              const p = productMap[item.productId];
              const img = p ? productImages(p)[0] : undefined;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  {img ? (
                    <ImageWithFallback
                      src={img}
                      alt={p?.name ?? ""}
                      className="size-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-md bg-muted" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{p?.name ?? `Product #${item.productId}`}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm tabular-nums">
                    {formatPrice(Number(item.priceAtPurchase) * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(Number(order.finalAmount))}</span>
          </div>
          {order.status === "PENDING" && (
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await Orders.retryPayment(order.id);
                  toast.success("Payment retry initiated");
                } catch (e) {
                  toast.error(getApiErrorMessage(e));
                }
              }}
            >
              Retry payment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
