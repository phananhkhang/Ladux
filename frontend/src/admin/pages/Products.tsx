import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill } from "../components/StatusPill";

interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: "Đang bán" | "Hết hàng" | "Ngưng";
}

const rows: Product[] = [
  { id: 1, sku: "AT-ZEN-001", name: "Aura Zenith X1 Pro", brand: "Aura", category: "Laptop Gaming", price: 64900000, stock: 12, status: "Đang bán" },
  { id: 2, sku: "AT-NMB-014", name: "Aura Nimbus 14", brand: "Aura", category: "Ultrabook", price: 32450000, stock: 24, status: "Đang bán" },
  { id: 3, sku: "RG-STRIX-G", name: "ROG Strix G16 RTX 4070", brand: "ASUS ROG", category: "Laptop Gaming", price: 52900000, stock: 0, status: "Hết hàng" },
  { id: 4, sku: "MBP-M4-14", name: 'MacBook Pro 14" M4', brand: "Apple", category: "Creator", price: 49900000, stock: 8, status: "Đang bán" },
  { id: 5, sku: "RZR-BLD-15", name: "Razer Blade 15 OLED", brand: "Razer", category: "Laptop Gaming", price: 71200000, stock: 3, status: "Đang bán" },
  { id: 6, sku: "DELL-XPS-13", name: "Dell XPS 13 Plus", brand: "Dell", category: "Ultrabook", price: 38500000, stock: 0, status: "Ngưng" },
];

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const columns: ColumnDef<Product>[] = [
  { key: "sku", header: "SKU", cell: (r) => <span className="font-mono text-xs text-zinc-400">{r.sku}</span>, searchValue: (r) => r.sku },
  {
    key: "name",
    header: "Sản phẩm",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold text-neon/70 ring-1 ring-white/5">
          {r.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
        </span>
        <div>
          <p className="font-semibold text-white">{r.name}</p>
          <p className="text-xs text-zinc-500">{r.category}</p>
        </div>
      </div>
    ),
    searchValue: (r) => r.name + " " + r.category,
  },
  { key: "brand", header: "Thương hiệu", cell: (r) => <span className="text-zinc-300">{r.brand}</span>, searchValue: (r) => r.brand },
  { key: "price", header: "Giá", className: "text-right", cell: (r) => <span className="font-mono text-zinc-200">{fmt(r.price)}</span> },
  { key: "stock", header: "Tồn kho", className: "text-right", cell: (r) => <span className={r.stock === 0 ? "text-rose-300" : "text-zinc-200"}>{r.stock}</span> },
  {
    key: "status",
    header: "Trạng thái",
    cell: (r) => (
      <StatusPill tone={r.status === "Đang bán" ? "neon" : r.status === "Hết hàng" ? "amber" : "zinc"}>
        {r.status}
      </StatusPill>
    ),
  },
  {
    key: "actions",
    header: "Thao tác",
    className: "text-right",
    cell: () => (
      <div className="flex items-center justify-end gap-1.5">
        <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-neon/10 hover:text-neon">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-6" data-testid="page-products">
      <PageHeader />
      <DataTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Tìm sản phẩm theo SKU, tên, danh mục…"
        testId="products"
      />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Danh sách sản phẩm</h2>
        <p className="mt-1 text-sm text-zinc-500">Quản lý toàn bộ sản phẩm Laptop, phụ kiện trên cửa hàng.</p>
      </div>
      <Button data-testid="products-create-button">
        <Plus className="h-4 w-4" />
        Thêm sản phẩm
      </Button>
    </div>
  );
}
