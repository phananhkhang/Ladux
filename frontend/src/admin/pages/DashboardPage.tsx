import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, Boxes, CreditCard, PackageCheck, ShoppingBag, Truck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { AdminTable, PageHeader, Panel, StatusBadge, type AdminColumn } from "../components/AdminUI";
import { adminQueryKeys } from "../queryKeys";
import type { OrderResponse, ProductResponse, PurchaseOrderResponse } from "../types";
import { formatBackendDateTime, formatCurrency, getApiErrorMessage } from "../utils";

type DashboardResult = {
  counts: Record<string, number | null>;
  recentOrders: OrderResponse[];
  recentPurchaseOrders: PurchaseOrderResponse[];
  lowStockProducts: ProductResponse[];
};

async function loadDashboard(): Promise<DashboardResult> {
  const requests = await Promise.allSettled([
    adminApi.orders.list({ page: 0, size: 5, sort: "createdAt,desc" }),
    adminApi.orders.byStatus("PENDING", { page: 0, size: 1 }),
    adminApi.orders.byStatus("CONFIRMED", { page: 0, size: 1 }),
    adminApi.orders.byStatus("SHIPPED", { page: 0, size: 1 }),
    adminApi.customers.list({ page: 0, size: 1 }),
    adminApi.users.list({ page: 0, size: 1 }),
    adminApi.products.list({ page: 0, size: 12, sort: "createdAt,desc" }),
    adminApi.suppliers.list({ page: 0, size: 1 }),
    adminApi.purchaseOrders.list({ page: 0, size: 5, sort: "createdAt,desc" }),
    adminApi.payments.byStatus("PENDING", { page: 0, size: 1 }),
  ]);

  const total = (index: number) => requests[index].status === "fulfilled" ? requests[index].value.totalElements : null;
  const content = <T,>(index: number): T[] => requests[index].status === "fulfilled" ? requests[index].value.content as T[] : [];
  const products = content<ProductResponse>(6);

  return {
    counts: {
      orders: total(0), pendingOrders: total(1), confirmedOrders: total(2), shippedOrders: total(3),
      customers: total(4), users: total(5), products: total(6), suppliers: total(7),
      purchaseOrders: total(8), pendingPayments: total(9),
    },
    recentOrders: content<OrderResponse>(0),
    recentPurchaseOrders: content<PurchaseOrderResponse>(8),
    lowStockProducts: products.filter((product) => (product.variants ?? []).some((variant) => variant.stockQuantity <= 5)),
  };
}

const orderColumns: AdminColumn<OrderResponse>[] = [
  { key: "id", header: "Đơn hàng", render: (row) => <div><Link to={`/admin/orders/${row.id}`} className="font-extrabold text-slate-900 hover:text-indigo-600">#{row.id}</Link><p className="mt-1 text-xs text-slate-400">User {row.userId}</p></div> },
  { key: "date", header: "Thời gian", render: (row) => formatBackendDateTime(row.createdAt) },
  { key: "amount", header: "Tổng tiền", render: (row) => <span className="font-bold text-slate-900">{formatCurrency(row.finalAmount)}</span> },
  { key: "status", header: "Trạng thái", render: (row) => <StatusBadge value={row.status} /> },
];

export default function DashboardPage() {
  const query = useQuery({ queryKey: adminQueryKeys.dashboard, queryFn: loadDashboard, staleTime: 60_000 });
  const counts = query.data?.counts ?? {};
  const cards = [
    { label: "Tổng đơn hàng", value: counts.orders, helper: `${counts.pendingOrders ?? "—"} đang chờ xác nhận`, icon: ShoppingBag, iconClass: "bg-indigo-50 text-indigo-600", path: "/admin/orders" },
    { label: "Sản phẩm", value: counts.products, helper: "Catalog hiện có", icon: Boxes, iconClass: "bg-emerald-50 text-emerald-600", path: "/admin/products" },
    { label: "Khách hàng", value: counts.customers, helper: `${counts.users ?? "—"} tài khoản hệ thống`, icon: UsersRound, iconClass: "bg-violet-50 text-violet-600", path: "/admin/customers" },
    { label: "Thanh toán chờ", value: counts.pendingPayments, helper: "Cần kiểm tra", icon: CreditCard, iconClass: "bg-amber-50 text-amber-600", path: "/admin/payments?status=PENDING" },
  ] as const;

  return (
    <>
      <PageHeader title="Tổng quan vận hành" description="Báo cáo số liệu tổng quan hệ thống." actions={<span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Dữ liệu trực tiếp</span>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return <Link key={card.label} to={card.path} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
            <div className="flex items-start justify-between"><span className={`rounded-xl p-2.5 ${card.iconClass}`}><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-600" /></div>
            <p className="mt-5 text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{query.isLoading ? <span className="inline-block h-9 w-20 animate-pulse rounded bg-slate-100" /> : card.value?.toLocaleString("vi-VN") ?? "—"}</p>
            <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
          </Link>;
        })}
      </div>

      {query.isError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{getApiErrorMessage(query.error)}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Panel>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-extrabold text-slate-900">Đơn hàng gần đây</h2><p className="mt-1 text-xs text-slate-400">5 đơn mới nhất backend trả về</p></div><Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Xem tất cả</Link></div>
          <AdminTable rows={query.data?.recentOrders ?? []} columns={orderColumns} isLoading={query.isLoading} />
        </Panel>
        <div className="space-y-6">
          <Panel className="p-5">
            <div className="flex items-center justify-between"><div><h2 className="font-extrabold text-slate-900">Đơn nhập hàng</h2><p className="mt-1 text-xs text-slate-400">Theo dõi luồng cung ứng</p></div><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Truck className="h-5 w-5" /></span></div>
            <div className="mt-5 space-y-3">
              {query.isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
              {query.data?.recentPurchaseOrders.slice(0, 4).map((order) => <Link key={order.id} to={`/admin/purchase-orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-indigo-200 hover:bg-indigo-50/40"><div><p className="text-sm font-bold text-slate-900">PO #{order.id}</p><p className="mt-1 text-xs text-slate-400">{order.supplierName || `NCC #${order.supplierId}`}</p></div><div className="text-right"><p className="text-xs font-bold text-slate-700">{formatCurrency(order.totalAmount)}</p><div className="mt-1"><StatusBadge value={order.status} /></div></div></Link>)}
              {!query.isLoading && !query.data?.recentPurchaseOrders.length && <p className="py-8 text-center text-sm text-slate-400">Chưa có đơn nhập hàng</p>}
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><AlertTriangle className="h-5 w-5" /></span><div><h2 className="font-extrabold text-slate-900">Cảnh báo kho thấp</h2><p className="text-xs text-slate-400">Chỉ trên các sản phẩm đã tải</p></div></div>
            <div className="mt-4 space-y-2">{query.data?.lowStockProducts.slice(0, 4).map((product) => <Link key={product.id} to={`/admin/products/${product.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm hover:bg-amber-50"><span className="truncate font-semibold text-slate-700">{product.name}</span><span className="ml-3 text-xs font-bold text-amber-700">{Math.min(...product.variants.map((variant) => variant.stockQuantity))} còn lại</span></Link>)}{!query.isLoading && !query.data?.lowStockProducts.length && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700"><PackageCheck className="h-4 w-4" />Chưa thấy cảnh báo trên dữ liệu đã tải</div>}</div>
          </Panel>
        </div>
      </div>
    </>
  );
}
