import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminOrders as OrdersApi, getApiErrorMessage } from "@/api/client";
import type { OrderResponse, OrderStatus } from "@/api/types";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader } from "../../components/admin-layout";
import { DataTable, Column } from "../../components/data-table";
import { OrderStatusBadge } from "../../components/shared";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const FILTERS: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<OrderResponse | null>(null);
  const [tracking, setTracking] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (status: OrderStatus | "ALL" = filter) => {
    setLoading(true);
    try {
      const page =
        status === "ALL"
          ? await OrdersApi.list({ size: 50, sort: "createdAt,desc" })
          : await OrdersApi.byStatus(status, { size: 50, sort: "createdAt,desc" });
      setOrders(page.content ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to load orders"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (order: OrderResponse, status: OrderStatus) => {
    try {
      const updated = await OrdersApi.updateStatus(order.id, {
        status,
        trackingNumber: status === "SHIPPED" ? tracking || order.trackingNumber : undefined,
      });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      setSelected(updated);
      toast.success(`Order #${order.id} → ${status}`);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const columns: Column<OrderResponse>[] = [
    {
      key: "id",
      header: "Order",
      sortable: true,
      sortValue: (r) => r.id,
      render: (r) => <span>#{r.id}</span>,
    },
    {
      key: "user",
      header: "User",
      render: (r) => <span className="text-sm">User #{r.userId}</span>,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.createdAt,
      render: (r) => (
        <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (r) => (
        <span className="text-xs text-muted-foreground">{r.paymentProvider ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <OrderStatusBadge status={r.status} />,
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      sortValue: (r) => Number(r.finalAmount),
      className: "text-right",
      render: (r) => (
        <span className="tabular-nums">{formatPrice(Number(r.finalAmount))}</span>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Orders" subtitle={`${orders.length} orders`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={orders}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.id} ${r.userId} ${r.shippingAddress}`}
          onRowClick={(o) => {
            setSelected(o);
            setTracking(o.trackingNumber ?? "");
          }}
        />
      )}

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  #{selected.id} <OrderStatusBadge status={selected.status} />
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-6">
                <div className="text-sm text-muted-foreground">
                  <p>User #{selected.userId}</p>
                  <p>{selected.shippingAddress}</p>
                  <p className="mt-1">
                    {formatDate(selected.createdAt)} · {selected.paymentProvider ?? "—"}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {(selected.orderItems ?? []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        Product #{item.productId} × {item.quantity}
                      </span>
                      <span className="tabular-nums">
                        {formatPrice(Number(item.priceAtPurchase) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {formatPrice(Number(selected.finalAmount))}
                    </span>
                  </div>
                </div>
                <Separator />
                {selected.status === "CONFIRMED" && (
                  <div className="space-y-2">
                    <Label>Tracking number (required for SHIPPED)</Label>
                    <Input
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      placeholder="VN123456789"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUS[selected.status].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={s === "CANCELLED" ? "destructive" : "default"}
                      onClick={() => void updateStatus(selected, s)}
                    >
                      → {s}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
