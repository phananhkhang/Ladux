import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill } from "../components/StatusPill";
import { Products, getApiErrorMessage } from "../../api/client";
import type { ProductResponse } from "../../types/api";
import { toast } from "sonner";

interface UiProduct {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: "Đang bán" | "Hết hàng" | "Ngưng";
  _raw: ProductResponse;
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

function mapToUi(p: ProductResponse): UiProduct {
  const brand = p.brand?.name || "—";
  const cat = p.category?.name || "—";
  const price = Number(p.discountPrice ?? p.basePrice ?? 0);
  const stock = p.stockQuantity ?? 0;
  let status: UiProduct["status"] = p.isActive === false || p.active === false ? "Ngưng" : (stock > 0 ? "Đang bán" : "Hết hàng");
  return { id: p.id, sku: p.sku, name: p.name, brand, category: cat, price, stock, status, _raw: p };
}

export default function ProductsPage() {
  const [rows, setRows] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await Products.list({ page: 0, size: 50 });
      setRows((data.content || []).map(mapToUi));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Không tải được danh sách sản phẩm"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await Products.delete(id);
      toast.success("Đã xóa sản phẩm");
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Xóa thất bại"));
    }
  };

  const handleCreateStub = async () => {
    const name = prompt("Tên sản phẩm mới:");
    if (!name) return;
    // Minimal create; real form would be richer. Uses first brand/cat if any (demo)
    try {
      const sku = "AT-" + Date.now().toString().slice(-6);
      // Note: backend requires valid brandId/categoryId; this may fail if no data seeded.
      const created = await Products.create({
        brandId: 1,
        categoryId: 1,
        sku,
        name,
        basePrice: 10000000,
        stockQuantity: 10,
        isActive: true,
      });
      toast.success("Tạo sản phẩm thành công (demo)");
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Tạo thất bại (cần brand/category hợp lệ)"));
    }
  };

  const columns: ColumnDef<UiProduct>[] = [
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
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-neon/10 hover:text-neon" title="Sửa (demo)">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleDelete(r.id)} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300" title="Xóa">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" data-testid="page-products">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Danh sách sản phẩm</h2>
          <p className="mt-1 text-sm text-zinc-500">Quản lý toàn bộ sản phẩm Laptop, phụ kiện trên cửa hàng.</p>
        </div>
        <Button onClick={handleCreateStub} data-testid="products-create-button">
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>
      {loading ? (
        <div className="h-40 rounded-2xl bg-surface animate-pulse" />
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          searchPlaceholder="Tìm sản phẩm theo SKU, tên, danh mục…"
          testId="products"
        />
      )}
    </div>
  );
}
