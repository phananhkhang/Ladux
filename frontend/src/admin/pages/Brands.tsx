import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { DataTable, type ColumnDef } from "../components/DataTable";

interface Brand {
  id: number;
  name: string;
  country: string;
  products: number;
  featured: boolean;
}

const rows: Brand[] = [
  { id: 1, name: "Aura", country: "Việt Nam", products: 12, featured: true },
  { id: 2, name: "ASUS ROG", country: "Đài Loan", products: 28, featured: true },
  { id: 3, name: "Razer", country: "Hoa Kỳ / Singapore", products: 14, featured: true },
  { id: 4, name: "Apple", country: "Hoa Kỳ", products: 9, featured: true },
  { id: 5, name: "Dell", country: "Hoa Kỳ", products: 22, featured: false },
  { id: 6, name: "MSI", country: "Đài Loan", products: 19, featured: false },
  { id: 7, name: "Lenovo Legion", country: "Trung Quốc", products: 17, featured: false },
];

const columns: ColumnDef<Brand>[] = [
  {
    key: "name",
    header: "Thương hiệu",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-xs font-bold uppercase text-neon ring-1 ring-white/5">
          {r.name.slice(0, 2)}
        </span>
        <span className="font-semibold text-white">{r.name}</span>
      </div>
    ),
    searchValue: (r) => r.name,
  },
  { key: "country", header: "Quốc gia", cell: (r) => <span className="text-zinc-400">{r.country}</span> },
  { key: "products", header: "Sản phẩm", className: "text-right", cell: (r) => <span className="font-mono text-zinc-200">{r.products}</span> },
  {
    key: "featured",
    header: "Nổi bật",
    cell: (r) => (
      <span className={`text-xs font-semibold ${r.featured ? "text-neon" : "text-zinc-500"}`}>
        {r.featured ? "✓ Featured" : "—"}
      </span>
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

export default function BrandsPage() {
  return (
    <div className="space-y-6" data-testid="page-brands">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Thương hiệu</h2>
          <p className="mt-1 text-sm text-zinc-500">Quản lý các thương hiệu hợp tác phân phối với AuraTech.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Thêm thương hiệu
        </Button>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm thương hiệu…" testId="brands" />
    </div>
  );
}
