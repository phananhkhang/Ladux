import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { DataTable, type ColumnDef } from "../components/DataTable";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: string | null;
  products: number;
}

const rows: Category[] = [
  { id: 1, name: "Laptop Gaming", slug: "laptop-gaming", parent: null, products: 48 },
  { id: 2, name: "Ultrabook", slug: "ultrabook", parent: null, products: 32 },
  { id: 3, name: "Creator Studio", slug: "creator-studio", parent: null, products: 18 },
  { id: 4, name: "Phụ kiện - Chuột", slug: "accessory-mouse", parent: "Phụ kiện", products: 22 },
  { id: 5, name: "Phụ kiện - Bàn phím", slug: "accessory-keyboard", parent: "Phụ kiện", products: 19 },
  { id: 6, name: "Tai nghe Gaming", slug: "gaming-headset", parent: "Phụ kiện", products: 11 },
];

const columns: ColumnDef<Category>[] = [
  { key: "name", header: "Tên danh mục", cell: (r) => <span className="font-semibold text-white">{r.name}</span>, searchValue: (r) => r.name },
  { key: "slug", header: "Slug", cell: (r) => <code className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-neon/80">{r.slug}</code>, searchValue: (r) => r.slug },
  { key: "parent", header: "Danh mục cha", cell: (r) => <span className="text-zinc-400">{r.parent ?? "—"}</span> },
  { key: "products", header: "Số sản phẩm", className: "text-right", cell: (r) => <span className="font-mono text-zinc-200">{r.products}</span> },
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

export default function CategoriesPage() {
  return (
    <div className="space-y-6" data-testid="page-categories">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Danh mục sản phẩm</h2>
          <p className="mt-1 text-sm text-zinc-500">Phân loại sản phẩm thành nhóm cha - nhóm con.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm danh mục…" testId="categories" />
    </div>
  );
}
