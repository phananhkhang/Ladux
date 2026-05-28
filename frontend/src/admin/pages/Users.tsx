import { ShieldCheck, Ban, Pencil } from "lucide-react";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { StatusPill } from "../components/StatusPill";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Customer" | "Admin" | "Staff";
  orders: number;
  status: "active" | "blocked";
  joined: string;
}

const rows: User[] = [
  { id: 1, name: "Nguyễn An", email: "an.nguyen@gmail.com", role: "Customer", orders: 14, status: "active", joined: "12/01/2025" },
  { id: 2, name: "Trần Bích", email: "bich.tran@gmail.com", role: "Customer", orders: 6, status: "active", joined: "03/03/2025" },
  { id: 3, name: "Lê Cường", email: "cuong.le@outlook.com", role: "Customer", orders: 22, status: "active", joined: "21/06/2024" },
  { id: 4, name: "Aura Admin", email: "admin@auratech.io", role: "Admin", orders: 0, status: "active", joined: "01/01/2024" },
  { id: 5, name: "Phạm Duyên", email: "duyen.pham@yahoo.com", role: "Customer", orders: 2, status: "blocked", joined: "10/04/2025" },
  { id: 6, name: "Ops Minh", email: "minh.ops@auratech.io", role: "Staff", orders: 0, status: "active", joined: "18/02/2025" },
];

const roleTone: Record<User["role"], "neon" | "amber" | "zinc"> = {
  Admin: "neon",
  Staff: "amber",
  Customer: "zinc",
};

const columns: ColumnDef<User>[] = [
  {
    key: "name",
    header: "Người dùng",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-neon/10 text-xs font-bold text-neon ring-1 ring-neon/20">
          {r.name.split(" ").map((w) => w[0]).slice(-2).join("")}
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{r.name}</p>
          <p className="text-xs text-zinc-500">{r.email}</p>
        </div>
      </div>
    ),
    searchValue: (r) => r.name + " " + r.email,
  },
  { key: "role", header: "Vai trò", cell: (r) => <StatusPill tone={roleTone[r.role]}>{r.role}</StatusPill>, searchValue: (r) => r.role },
  { key: "orders", header: "Đơn", className: "text-right", cell: (r) => <span className="font-mono text-zinc-300">{r.orders}</span> },
  {
    key: "status",
    header: "Trạng thái",
    cell: (r) => (
      <StatusPill tone={r.status === "active" ? "neon" : "rose"}>
        {r.status === "active" ? "Hoạt động" : "Đã chặn"}
      </StatusPill>
    ),
  },
  { key: "joined", header: "Tham gia", cell: (r) => <span className="text-xs text-zinc-500">{r.joined}</span> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    cell: () => (
      <div className="flex items-center justify-end gap-1.5">
        <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-neon/10 hover:text-neon">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300">
          <Ban className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  },
];

export default function UsersPage() {
  return (
    <div className="space-y-6" data-testid="page-users">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">Tài khoản người dùng</h2>
        <p className="mt-1 text-sm text-zinc-500">Quản lý khách hàng và nhân viên có quyền truy cập hệ thống.</p>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Tìm tên, email, vai trò…"
        testId="users"
        toolbarRight={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 text-sm font-semibold text-neon transition hover:bg-neon/20">
            <ShieldCheck className="h-4 w-4" /> Mời thành viên
          </button>
        }
      />
    </div>
  );
}
