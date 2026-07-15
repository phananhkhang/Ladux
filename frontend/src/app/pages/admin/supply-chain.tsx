import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdminSuppliers as SuppliersApi,
  AdminPurchaseOrders as PurchaseOrdersApi,
  AdminStockMovements as StockMovementsApi,
  Products,
  getApiErrorMessage,
} from "@/api/client";
import type {
  ProductResponse,
  PurchaseOrderResponse,
  StockMovementResponse,
  StockMovementType,
  SupplierResponse,
} from "@/api/types";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader } from "../../components/admin-layout";
import { DataTable, Column } from "../../components/data-table";
import { POStatusBadge, MovementBadge } from "../../components/shared";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// --------------------------- Suppliers ---------------------------------------

const emptySupplierForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  isActive: true,
};

export function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierResponse | null>(null);
  const [form, setForm] = useState(emptySupplierForm);

  const load = async () => {
    setLoading(true);
    try {
      const page = await SuppliersApi.list({ size: 50 });
      setSuppliers(page.content ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptySupplierForm);
    setOpen(true);
  };

  const openEdit = (r: SupplierResponse) => {
    setEditing(r);
    setForm({
      name: r.name ?? "",
      address: r.address ?? "",
      phone: r.phone ?? "",
      email: r.email ?? "",
      isActive: r.isActive,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    const body = {
      name: form.name.trim(),
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await SuppliersApi.update(editing.id, body);
        toast.success("Supplier updated");
      } else {
        await SuppliersApi.create(body);
        toast.success("Supplier created");
      }
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const columns: Column<SupplierResponse>[] = [
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => <span className="text-sm">{r.name}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => <span className="text-sm">{r.phone ?? "—"}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (r) => (
        <span className="text-sm text-muted-foreground">{r.email ?? "—"}</span>
      ),
    },
    {
      key: "active",
      header: "Active",
      render: (r) => <span className="text-sm">{r.isActive ? "Yes" : "No"}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await SuppliersApi.remove(r.id);
                toast.success(`Deleted ${r.name}`);
                await load();
              } catch (e) {
                toast.error(getApiErrorMessage(e));
              }
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers`}
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add supplier
          </Button>
        }
      />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={suppliers}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.name} ${r.email} ${r.phone}`}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit supplier" : "New supplier"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {(
              [
                ["name", "Name"],
                ["address", "Address"],
                ["phone", "Phone"],
                ["email", "Email"],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                />
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="size-4 rounded border-input"
              />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --------------------------- Purchase Orders ---------------------------------

export function AdminPurchaseOrders() {
  const [rows, setRows] = useState<PurchaseOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const page = await PurchaseOrdersApi.list({ size: 50, sort: "createdAt,desc" });
        setRows(page.content ?? []);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns: Column<PurchaseOrderResponse>[] = [
    {
      key: "id",
      header: "PO",
      render: (r) => <span>#{r.id}</span>,
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (r) => <span className="text-sm">{r.supplierName}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <POStatusBadge status={r.status} />,
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      render: (r) => (
        <span className="tabular-nums">{formatPrice(Number(r.totalAmount))}</span>
      ),
    },
    {
      key: "date",
      header: "Created",
      render: (r) => (
        <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Purchase Orders" subtitle={`${rows.length} POs`} />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.id} ${r.supplierName}`}
        />
      )}
    </div>
  );
}

// --------------------------- Stock Movements ---------------------------------

export function AdminStockMovements() {
  const [rows, setRows] = useState<StockMovementResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    quantity: "1",
    movementType: "ADJUSTMENT_IN" as StockMovementType,
    note: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const page = await StockMovementsApi.list({ size: 50, sort: "createdAt,desc" });
      setRows(page.content ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    void Products.list({ size: 50 }).then((p) => setProducts(p.content ?? []));
  }, []);

  const columns: Column<StockMovementResponse>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => <span className="text-sm">{r.productName}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (r) => <MovementBadge type={r.movementType} />,
    },
    {
      key: "qty",
      header: "Qty",
      render: (r) => <span className="tabular-nums">{r.quantity}</span>,
    },
    {
      key: "note",
      header: "Note",
      render: (r) => (
        <span className="text-sm text-muted-foreground">{r.note ?? "—"}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => (
        <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Stock Movements"
        subtitle={`${rows.length} movements`}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Adjust stock
          </Button>
        }
      />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.productName} ${r.note}`}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock adjustment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Product</Label>
              <Select
                value={form.productId}
                onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={form.movementType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, movementType: v as StockMovementType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADJUSTMENT_IN">ADJUSTMENT_IN</SelectItem>
                    <SelectItem value="ADJUSTMENT_OUT">ADJUSTMENT_OUT</SelectItem>
                    <SelectItem value="PURCHASE_IN">PURCHASE_IN</SelectItem>
                    <SelectItem value="DAMAGE_OUT">DAMAGE_OUT</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Note</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  await StockMovementsApi.adjust({
                    productId: Number(form.productId),
                    quantity: Number(form.quantity),
                    movementType: form.movementType,
                    note: form.note || null,
                  });
                  toast.success("Stock adjusted");
                  setOpen(false);
                  await load();
                } catch (e) {
                  toast.error(getApiErrorMessage(e));
                }
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
