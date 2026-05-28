import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill } from "../components/StatusPill";

interface Payment {
  id: string;
  orderId: string;
  method: "VNPAY" | "Momo" | "Visa" | "COD";
  amount: number;
  status: "Thành công" | "Pending" | "Thất bại";
  at: string;
}

const rows: Payment[] = [
  { id: "PAY-78231", orderId: "AT-10984", method: "Visa", amount: 48900000, status: "Thành công", at: "28/05 14:18" },
  { id: "PAY-78230", orderId: "AT-10983", method: "Momo", amount: 22150000, status: "Pending", at: "28/05 10:55" },
  { id: "PAY-78229", orderId: "AT-10982", method: "VNPAY", amount: 35000000, status: "Thành công", at: "28/05 09:36" },
  { id: "PAY-78228", orderId: "AT-10981", method: "COD", amount: 12450000, status: "Thất bại", at: "27/05 21:48" },
  { id: "PAY-78227", orderId: "AT-10980", method: "Visa", amount: 61200000, status: "Thành công", at: "27/05 16:30" },
];

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const methodColor: Record<Payment["method"], string> = {
  VNPAY: "text-sky-300",
  Momo: "text-rose-300",
  Visa: "text-amber-300",
  COD: "text-zinc-300",
};

const columns: ColumnDef<Payment>[] = [
  { key: "id", header: "Mã GD", cell: (r) => <span className="font-mono text-sm font-semibold text-neon">{r.id}</span>, searchValue: (r) => r.id },
  { key: "orderId", header: "Đơn hàng", cell: (r) => <span className="font-mono text-zinc-300">{r.orderId}</span>, searchValue: (r) => r.orderId },
  {
    key: "method",
    header: "Phương thức",
    cell: (r) => <span className={`font-semibold ${methodColor[r.method]}`}>{r.method}</span>,
  },
  { key: "amount", header: "Số tiền", className: "text-right", cell: (r) => <span className="font-mono text-zinc-200">{fmt(r.amount)}</span> },
  {
    key: "status",
    header: "Trạng thái",
    cell: (r) => (
      <StatusPill
        tone={r.status === "Thành công" ? "neon" : r.status === "Pending" ? "amber" : "rose"}
      >
        {r.status}
      </StatusPill>
    ),
  },
  { key: "at", header: "Thời gian", cell: (r) => <span className="text-xs text-zinc-500">{r.at}</span> },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6" data-testid="page-payments">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Giao dịch thanh toán</h2>
        <p className="mt-1 text-sm text-zinc-500">Quản lý các giao dịch qua VNPAY, Momo, Visa, COD.</p>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm mã GD, đơn hàng…" testId="payments" />
    </div>
  );
}
