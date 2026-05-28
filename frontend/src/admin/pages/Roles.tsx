import { DataTable, type ColumnDef } from "../components/DataTable";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  members: number;
}

const rows: Role[] = [
  {
    id: 1,
    name: "Super Admin",
    description: "Toàn quyền hệ thống",
    permissions: ["all"],
    members: 2,
  },
  {
    id: 2,
    name: "Catalog Manager",
    description: "Quản lý sản phẩm, danh mục, thương hiệu",
    permissions: ["product.*", "category.*", "brand.*"],
    members: 4,
  },
  {
    id: 3,
    name: "Sales Ops",
    description: "Xử lý đơn hàng và thanh toán",
    permissions: ["order.*", "payment.read", "cart.read"],
    members: 6,
  },
  {
    id: 4,
    name: "Marketing",
    description: "Quản lý coupon và đánh giá",
    permissions: ["coupon.*", "review.*"],
    members: 3,
  },
  {
    id: 5,
    name: "Customer",
    description: "Người dùng mặc định",
    permissions: ["self.profile", "self.orders"],
    members: 12480,
  },
];

const columns: ColumnDef<Role>[] = [
  { key: "name", header: "Vai trò", cell: (r) => <span className="font-semibold text-white">{r.name}</span>, searchValue: (r) => r.name },
  { key: "desc", header: "Mô tả", cell: (r) => <span className="text-zinc-400">{r.description}</span> },
  {
    key: "permissions",
    header: "Quyền",
    cell: (r) => (
      <div className="flex flex-wrap gap-1.5">
        {r.permissions.map((p) => (
          <code key={p} className="rounded bg-neon/10 px-2 py-0.5 font-mono text-[10px] text-neon ring-1 ring-neon/20">
            {p}
          </code>
        ))}
      </div>
    ),
  },
  { key: "members", header: "Thành viên", className: "text-right", cell: (r) => <span className="font-mono text-zinc-200">{r.members}</span> },
];

export default function RolesPage() {
  return (
    <div className="space-y-6" data-testid="page-roles">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Phân quyền hệ thống</h2>
        <p className="mt-1 text-sm text-zinc-500">Định nghĩa các Role và đặc quyền truy cập.</p>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Tìm vai trò…" testId="roles" />
    </div>
  );
}
