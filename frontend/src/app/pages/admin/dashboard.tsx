import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  AdminOrders as OrdersApi,
  AdminCustomers as CustomersApi,
  Products,
  getApiErrorMessage,
} from "@/api/client";
import type { OrderResponse, ProductResponse } from "@/api/types";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader } from "../../components/admin-layout";
import { OrderStatusBadge } from "../../components/shared";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

export function AdminDashboard() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [o, c, p] = await Promise.all([
          OrdersApi.list({ size: 50, sort: "createdAt,desc" }),
          CustomersApi.list({ size: 1 }),
          Products.list({ size: 50 }),
        ]);
        if (cancelled) return;
        setOrders(o.content ?? []);
        setCustomerCount(c.totalElements ?? 0);
        setProducts(p.content ?? []);
      } catch (e) {
        if (!cancelled) toast.error(getApiErrorMessage(e, "Failed to load dashboard"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((s, o) => s + Number(o.finalAmount), 0),
    [orders],
  );

  const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === "CANCELLED") return;
      const d = new Date(o.createdAt);
      const key = d.toLocaleString("en", { month: "short" });
      map.set(key, (map.get(key) ?? 0) + Number(o.finalAmount));
    });
    return [...map.entries()].map(([month, value]) => ({ month, value }));
  }, [orders]);

  const categorySales = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const name = p.category?.name ?? "Other";
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return [...map.entries()].map(([name, units]) => ({ name, units }));
  }, [products]);

  const recent = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const stats = [
    {
      label: "Revenue (loaded)",
      value: formatPrice(revenue),
      change: `${orders.length} orders`,
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: String(orders.length),
      change: "last page",
      icon: ShoppingBag,
    },
    {
      label: "Customers",
      value: String(customerCount),
      change: "total",
      icon: Users,
    },
    {
      label: "Low stock items",
      value: String(lowStock),
      change: "≤ 5 units",
      icon: Package,
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Live data from Ladux API"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon size={18} className="text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-2xl tabular-nums">{s.value}</span>
              <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400">
                <ArrowUpRight size={12} /> {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4">Revenue by month</h3>
          {byMonth.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No order data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={byMonth}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-foreground)",
                  }}
                  formatter={(v: number) => formatPrice(v)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4">Products by category</h3>
          {categorySales.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No products</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categorySales}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar dataKey="units" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h3>Recent orders</h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/orders">
              View all <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
        <div className="divide-y">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No orders yet</p>
          ) : (
            recent.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-4 text-sm">
                <span className="w-20">#{o.id}</span>
                <span className="flex-1 text-muted-foreground">User #{o.userId}</span>
                <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
                <OrderStatusBadge status={o.status} />
                <span className="w-24 text-right tabular-nums">
                  {formatPrice(Number(o.finalAmount))}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
