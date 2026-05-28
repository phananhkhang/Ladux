import { Star, Trash2, Eye } from "lucide-react";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill } from "../components/StatusPill";

interface Review {
  id: number;
  customer: string;
  product: string;
  rating: number;
  comment: string;
  status: "Đã duyệt" | "Chờ duyệt" | "Đã ẩn";
  at: string;
}

const rows: Review[] = [
  { id: 1, customer: "Nguyễn An", product: "Aura Zenith X1 Pro", rating: 5, comment: "Máy mạnh, build chắc, đèn RGB cực đẹp. Rất đáng tiền!", status: "Đã duyệt", at: "28/05/2026" },
  { id: 2, customer: "Trần Bích", product: "MacBook Pro 14 M4", rating: 4, comment: "Pin trâu, màn đẹp, giá hơi cao nhưng xứng đáng.", status: "Đã duyệt", at: "27/05/2026" },
  { id: 3, customer: "Lê Cường", product: "ROG Strix G16", rating: 2, comment: "Nóng và ồn khi chơi game AAA.", status: "Chờ duyệt", at: "27/05/2026" },
  { id: 4, customer: "Phạm Duyên", product: "Aura Nimbus 14", rating: 5, comment: "Mỏng nhẹ, hiệu năng đủ dùng văn phòng.", status: "Đã duyệt", at: "26/05/2026" },
  { id: 5, customer: "Hoàng Em", product: "Razer Blade 15", rating: 1, comment: "Sản phẩm lỗi pixel màn hình.", status: "Đã ẩn", at: "25/05/2026" },
];

const columns: ColumnDef<Review>[] = [
  {
    key: "customer",
    header: "Khách",
    cell: (r) => <span className="font-semibold text-white">{r.customer}</span>,
    searchValue: (r) => r.customer,
  },
  { key: "product", header: "Sản phẩm", cell: (r) => <span className="text-zinc-300">{r.product}</span>, searchValue: (r) => r.product },
  {
    key: "rating",
    header: "Đánh giá",
    cell: (r) => (
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < r.rating ? "fill-neon text-neon" : "text-zinc-700"}`}
            strokeWidth={1.5}
          />
        ))}
      </span>
    ),
  },
  {
    key: "comment",
    header: "Bình luận",
    cell: (r) => <span className="line-clamp-1 max-w-md text-sm text-zinc-400">"{r.comment}"</span>,
    searchValue: (r) => r.comment,
  },
  {
    key: "status",
    header: "Trạng thái",
    cell: (r) => (
      <StatusPill tone={r.status === "Đã duyệt" ? "neon" : r.status === "Chờ duyệt" ? "amber" : "rose"}>
        {r.status}
      </StatusPill>
    ),
  },
  { key: "at", header: "Ngày", cell: (r) => <span className="text-xs text-zinc-500">{r.at}</span> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    cell: () => (
      <div className="flex items-center justify-end gap-1.5">
        <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-neon/10 hover:text-neon">
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6" data-testid="page-reviews">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Đánh giá & Bình luận</h2>
        <p className="mt-1 text-sm text-zinc-500">Duyệt và quản lý phản hồi của khách hàng về sản phẩm.</p>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm khách, sản phẩm, nội dung…" testId="reviews" />
    </div>
  );
}
