import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { Brands, getApiErrorMessage } from "../../api/client";
import type { BrandResponse } from "../../types/api";
import { toast } from "sonner";

interface UiBrand extends BrandResponse {}

export default function BrandsPage() {
  const [rows, setRows] = useState<UiBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await Brands.list();
      setRows(list || []);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Tải brand thất bại"));
      setRows([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const name = prompt("Tên brand mới:");
    if (!name) return;
    try {
      await Brands.create({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), logoUrl: null });
      toast.success("Đã tạo brand");
      await load();
    } catch (e) { toast.error(getApiErrorMessage(e, "Tạo brand thất bại")); }
  };

  const del = async (id: number) => {
    if (!confirm("Xóa brand?")) return;
    try { await Brands.delete(id); toast.success("Đã xóa"); await load(); }
    catch (e) { toast.error(getApiErrorMessage(e, "Xóa thất bại")); }
  };

  const columns: ColumnDef<UiBrand>[] = [
    {
      key: "name",
      header: "Thương hiệu",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-xs font-bold uppercase text-neon ring-1 ring-white/5">
            {(r.name || "").slice(0, 2)}
          </span>
          <span className="font-semibold text-white">{r.name}</span>
        </div>
      ),
      searchValue: (r) => r.name,
    },
    { key: "slug", header: "Slug", cell: (r) => <span className="text-zinc-400 font-mono text-xs">{r.slug}</span> },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-neon/10 hover:text-neon">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => del(r.id)} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" data-testid="page-brands">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Thương hiệu</h2>
          <p className="mt-1 text-sm text-zinc-500">Quản lý các thương hiệu hợp tác phân phối với AuraTech.</p>
        </div>
        <Button onClick={create}>
          <Plus className="h-4 w-4" />
          Thêm thương hiệu
        </Button>
      </div>
      {loading ? <div className="h-40 bg-surface rounded animate-pulse" /> : (
        <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm thương hiệu…" testId="brands" />
      )}
    </div>
  );
}
