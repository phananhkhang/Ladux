import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill, orderStatusTone } from "../components/StatusPill";

interface OrderHistory {
  id: number;
  orderId: string;
  from: string;
  to: string;
  actor: string;
  at: string;
}

const rows: OrderHistory[] = [
  { id: 1, orderId: "AT-10984", from: "Đang giao", to: "Đã giao", actor: "shipper_07", at: "28/05/2026 14:21" },
  { id: 2, orderId: "AT-10983", from: "Mới", to: "Đang xử lý", actor: "ops_minh", at: "28/05/2026 11:02" },
  { id: 3, orderId: "AT-10982", from: "Đang xử lý", to: "Đang giao", actor: "ops_thu", at: "28/05/2026 09:44" },
  { id: 4, orderId: "AT-10981", from: "Đang xử lý", to: "Đã huỷ", actor: "khách hàng", at: "27/05/2026 22:11" },
  { id: 5, orderId: "AT-10980", from: "Đang giao", to: "Đã giao", actor: "shipper_03", at: "27/05/2026 16:55" },
  { id: 6, orderId: "AT-10978", from: "Mới", to: "Đang xử lý", actor: "ops_minh", at: "26/05/2026 10:08" },
];

const columns: ColumnDef<OrderHistory>[] = [
  { key: "orderId", header: "Mã đơn", cell: (r) => <span className="font-mono text-sm font-semibold text-neon">{r.orderId}</span>, searchValue: (r) => r.orderId },
  {
    key: "transition",
    header: "Chuyển trạng thái",
    cell: (r) => (
      <div className="flex items-center gap-2">
        <StatusPill tone={orderStatusTone(r.from)}>{r.from}</StatusPill>
        <span className="text-zinc-600">→</span>
        <StatusPill tone={orderStatusTone(r.to)}>{r.to}</StatusPill>
      </div>
    ),
    searchValue: (r) => r.from + " " + r.to,
  },
  { key: "actor", header: "Người thực hiện", cell: (r) => <span className="text-zinc-300">{r.actor}</span>, searchValue: (r) => r.actor },
  { key: "at", header: "Thời điểm", cell: (r) => <span className="font-mono text-xs text-zinc-500">{r.at}</span> },
];

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6" data-testid="page-order-history">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Lịch sử cập nhật đơn</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Nhật ký mọi chuyển đổi trạng thái đơn hàng, kèm người thao tác.
        </p>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm theo mã đơn, trạng thái…" testId="order-history" />
    </div>
  );
}
