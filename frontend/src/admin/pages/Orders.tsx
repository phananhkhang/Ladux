import { Eye } from "lucide-react";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill, orderStatusTone } from "../components/StatusPill";

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  items: number;
  status: "Đã giao" | "Đang giao" | "Đang xử lý" | "Đã huỷ";
  date: string;
}

const rows: Order[] = [
  { id: "AT-10984", customer: "Nguyễn An", email: "an.nguyen@gmail.com", total: 48900000, items: 1, status: "Đã giao", date: "28/05/2026" },
  { id: "AT-10983", customer: "Trần Bích", email: "bich.tran@gmail.com", total: 22150000, items: 2, status: "Đang xử lý", date: "28/05/2026" },
  { id: "AT-10982", customer: "Lê Cường", email: "cuong.le@outlook.com", total: 35000000, items: 1, status: "Đang giao", date: "28/05/2026" },
  { id: "AT-10981", customer: "Phạm Duyên", email: "duyen.pham@yahoo.com", total: 12450000, items: 3, status: "Đã huỷ", date: "27/05/2026" },
  { id: "AT-10980", customer: "Hoàng Em", email: "em.hoang@gmail.com", total: 61200000, items: 2, status: "Đã giao", date: "27/05/2026" },
  { id: "AT-10979", customer: "Đỗ Phương", email: "phuong.do@gmail.com", total: 27800000, items: 1, status: "Đang xử lý", date: "26/05/2026" },
];

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const columns: ColumnDef<Order>[] = [
  { key: "id", header: "Mã đơn", cell: (r) => <span className="font-mono text-sm font-semibold text-neon">{r.id}</span>, searchValue: (r) => r.id },
  {
    key: "customer",
    header: "Khách hàng",
    cell: (r) => (
      <div>
        <p className="text-sm font-semibold text-white">{r.customer}</p>
        <p className="text-xs text-zinc-500">{r.email}</p>
      </div>
    ),
    searchValue: (r) => r.customer + " " + r.email,
  },
  { key: "items", header: "SP", className: "text-right", cell: (r) => <span className="text-zinc-300">{r.items}</span> },
  { key: "total", header: "Tổng", className: "text-right", cell: (r) => <span className="font-mono text-zinc-200">{fmt(r.total)}</span> },
  { key: "status", header: "Trạng thái", cell: (r) => <StatusPill tone={orderStatusTone(r.status)}>{r.status}</StatusPill> },
  { key: "date", header: "Ngày", cell: (r) => <span className="text-xs text-zinc-500">{r.date}</span> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    cell: () => (
      <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-neon/10 hover:text-neon">
        <Eye className="h-3.5 w-3.5" />
      </button>
    ),
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6" data-testid="page-orders">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Đơn hàng</h2>
        <p className="mt-1 text-sm text-zinc-500">Theo dõi và cập nhật trạng thái đơn hàng theo thời gian thực.</p>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm mã đơn, khách hàng…" testId="orders" />
    </div>
  );
}
