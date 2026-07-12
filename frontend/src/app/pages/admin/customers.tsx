import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCustomers as CustomersApi, getApiErrorMessage } from "@/api/client";
import type { CustomerLevel, CustomerResponse } from "@/api/types";
import { formatPrice } from "@/lib/format";
import { AdminHeader } from "../../components/admin-layout";
import { DataTable, Column } from "../../components/data-table";
import { LevelBadge } from "../../components/shared";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

const LEVELS: (CustomerLevel | "ALL")[] = [
  "ALL",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
];

export function AdminCustomers() {
  const [level, setLevel] = useState<CustomerLevel | "ALL">("ALL");
  const [rows, setRows] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const page =
          level === "ALL"
            ? await CustomersApi.list({ size: 50 })
            : await CustomersApi.byLevel(level, { size: 50 });
        if (!cancelled) setRows(page.content ?? []);
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          toast.error(getApiErrorMessage(e, "Failed to load customers"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [level]);

  const columns: Column<CustomerResponse>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      sortValue: (r) => r.fullName ?? r.username,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback>
              {(r.fullName || r.username || "?")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">{r.fullName || r.username}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (r) => <LevelBadge level={r.level} />,
    },
    {
      key: "points",
      header: "Loyalty points",
      sortable: true,
      sortValue: (r) => r.loyaltyPoints,
      render: (r) => (
        <span className="tabular-nums">{Number(r.loyaltyPoints).toLocaleString()}</span>
      ),
    },
    {
      key: "spent",
      header: "Total spent",
      sortable: true,
      sortValue: (r) => Number(r.totalSpent),
      className: "text-right",
      render: (r) => (
        <span className="tabular-nums">{formatPrice(Number(r.totalSpent))}</span>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Customers" subtitle={`${rows.length} customers`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Button
            key={l}
            variant={level === l ? "default" : "outline"}
            size="sm"
            onClick={() => setLevel(l)}
          >
            {l}
          </Button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.fullName} ${r.email} ${r.username}`}
        />
      )}
    </div>
  );
}
