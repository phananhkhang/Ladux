import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill } from "../components/StatusPill";

interface Coupon {
  id: number;
  code: string;
  type: "Percent" | "Fixed";
  value: string;
  used: number;
  limit: number;
  expires: string;
  status: "active" | "expired";
}

const rows: Coupon[] = [
  { id: 1, code: "AURA2026", type: "Percent", value: "15%", used: 128, limit: 500, expires: "31/12/2026", status: "active" },
  { id: 2, code: "WELCOME50", type: "Fixed", value: "₫500.000", used: 412, limit: 1000, expires: "30/06/2026", status: "active" },
  { id: 3, code: "LEGENDARY", type: "Percent", value: "25%", used: 24, limit: 100, expires: "15/05/2026", status: "expired" },
  { id: 4, code: "GAMERX", type: "Percent", value: "10%", used: 76, limit: 300, expires: "15/09/2026", status: "active" },
  { id: 5, code: "MACFAN", type: "Fixed", value: "₫1.500.000", used: 12, limit: 50, expires: "20/07/2026", status: "active" },
];

const columns: ColumnDef<Coupon>[] = [
  {
    key: "code",
    header: "Mã",
    cell: (r) => (
      <code className="rounded-lg bg-neon/10 px-2.5 py-1 font-mono text-xs font-bold tracking-widest text-neon ring-1 ring-neon/20">
        {r.code}
      </code>
    ),
    searchValue: (r) => r.code,
  },
  { key: "type", header: "Loại", cell: (r) => <span className="text-zinc-300">{r.type}</span> },
  { key: "value", header: "Giá trị", cell: (r) => <span className="font-mono font-semibold text-white">{r.value}</span> },
  {
    key: "usage",
    header: "Đã dùng",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-neon shadow-[0_0_10px_rgba(0,255,102,0.6)]"
            style={{ width: `${Math.min(100, (r.used / r.limit) * 100)}%` }}
          />
        </div>
        <span className="font-mono text-xs text-zinc-400">
          {r.used} / {r.limit}
        </span>
      </div>
    ),
  },
  { key: "expires", header: "Hết hạn", cell: (r) => <span className="text-xs text-zinc-500">{r.expires}</span> },
  {
    key: "status",
    header: "Trạng thái",
    cell: (r) => (
      <StatusPill tone={r.status === "active" ? "neon" : "rose"}>
        {r.status === "active" ? "Đang chạy" : "Hết hạn"}
      </StatusPill>
    ),
  },
];

export default function CouponsPage() {
  return (
    <div className="space-y-6" data-testid="page-coupons">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Mã giảm giá</h2>
          <p className="mt-1 text-sm text-zinc-500">Tạo & vận hành các coupon khuyến mãi theo chiến dịch.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Tạo coupon
        </Button>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm mã giảm giá…" testId="coupons" />
    </div>
  );
}
