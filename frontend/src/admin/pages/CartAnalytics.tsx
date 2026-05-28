import { Heart, ShoppingCart, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { DataTable, type ColumnDef } from "../components/DataTable";

interface CartRow {
  id: number;
  customer: string;
  items: number;
  value: number;
  lastActivity: string;
  type: "Cart" | "Wishlist";
}

const rows: CartRow[] = [
  { id: 1, customer: "Nguyễn An", items: 2, value: 71050000, lastActivity: "5 phút trước", type: "Cart" },
  { id: 2, customer: "Trần Bích", items: 1, value: 32450000, lastActivity: "12 phút trước", type: "Cart" },
  { id: 3, customer: "Lê Cường", items: 4, value: 18900000, lastActivity: "1 giờ trước", type: "Wishlist" },
  { id: 4, customer: "Phạm Duyên", items: 3, value: 24600000, lastActivity: "3 giờ trước", type: "Wishlist" },
  { id: 5, customer: "Hoàng Em", items: 1, value: 64900000, lastActivity: "Hôm qua", type: "Cart" },
];

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const columns: ColumnDef<CartRow>[] = [
  {
    key: "type",
    header: "Loại",
    cell: (r) => (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
          r.type === "Cart" ? "border-sky-400/30 bg-sky-400/10 text-sky-300" : "border-rose-400/30 bg-rose-400/10 text-rose-300"
        }`}
      >
        {r.type === "Cart" ? <ShoppingCart className="h-3 w-3" /> : <Heart className="h-3 w-3" />}
        {r.type}
      </span>
    ),
    searchValue: (r) => r.type,
  },
  { key: "customer", header: "Khách hàng", cell: (r) => <span className="font-semibold text-white">{r.customer}</span>, searchValue: (r) => r.customer },
  { key: "items", header: "SP", className: "text-right", cell: (r) => <span className="text-zinc-300">{r.items}</span> },
  { key: "value", header: "Giá trị", className: "text-right", cell: (r) => <span className="font-mono text-zinc-200">{fmt(r.value)}</span> },
  {
    key: "lastActivity",
    header: "Hoạt động gần nhất",
    cell: (r) => (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
        <Clock className="h-3 w-3" /> {r.lastActivity}
      </span>
    ),
  },
];

export default function CartAnalyticsPage() {
  const cartTotal = rows.filter((r) => r.type === "Cart").reduce((sum, r) => sum + r.value, 0);
  const wishlistTotal = rows.filter((r) => r.type === "Wishlist").reduce((sum, r) => sum + r.value, 0);
  return (
    <div className="space-y-6" data-testid="page-cart-analytics">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Giỏ hàng & Wishlist</h2>
        <p className="mt-1 text-sm text-zinc-500">Theo dõi sản phẩm khách đang quan tâm để remarketing đúng thời điểm.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={ShoppingCart}
          tone="sky"
          label="Tổng giá trị Cart đang chờ"
          value={fmt(cartTotal)}
          hint={`${rows.filter((r) => r.type === "Cart").length} giỏ`}
        />
        <StatCard
          icon={Heart}
          tone="rose"
          label="Tổng giá trị Wishlist"
          value={fmt(wishlistTotal)}
          hint={`${rows.filter((r) => r.type === "Wishlist").length} danh sách`}
        />
        <StatCard
          icon={Clock}
          tone="neon"
          label="Cart bỏ quên > 24h"
          value="3"
          hint="Cần email nhắc nhở"
        />
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm khách, loại…" testId="cart-analytics" />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof ShoppingCart;
  label: string;
  value: string;
  hint: string;
  tone: "neon" | "sky" | "rose";
}) {
  const toneMap = {
    neon: "bg-neon/10 text-neon ring-neon/20",
    sky: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
    rose: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
  } as const;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="mt-2">{value}</CardTitle>
            <p className="mt-1 text-xs text-zinc-500">{hint}</p>
          </div>
          <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${toneMap[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
