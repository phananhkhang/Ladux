import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdminSuppliers as SuppliersApi,
  AdminProductSuppliers as ProductSuppliersApi,
  AdminPurchaseOrders as PurchaseOrdersApi,
  AdminStockMovements as StockMovementsApi,
  Products,
  getApiErrorMessage,
} from "@/api/client";
import type {
  ProductResponse,
  ProductSupplierResponse,
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

export function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

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
  ];

  return (
    <div>
      <AdminHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers`}
        action={
          <Button onClick={() => setOpen(true)}>
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
            <DialogTitle>New supplier</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  await SuppliersApi.create({ ...form, isActive: true });
                  toast.success("Supplier created");
                  setOpen(false);
                  await load();
                } catch (e) {
                  toast.error(getApiErrorMessage(e));
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --------------------------- Product Suppliers -------------------------------

export function AdminProductSuppliers() {
  const [rows, setRows] = useState<ProductSupplierResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    supplierId: "",
    costPrice: "",
    leadTimeDays: "7",
  });

  useEffect(() => {
    void Products.list({ size: 50 }).then((p) => setProducts(p.content ?? []));
    void SuppliersApi.list({ size: 50 }).then((s) => setSuppliers(s.content ?? []));
  }, []);

  const loadForProduct = async (id: string) => {
    if (!id) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      setRows(await ProductSuppliersApi.byProduct(Number(id)));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<ProductSupplierResponse>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => <span className="text-sm">{r.productName}</span>,
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (r) => <span className="text-sm">{r.supplierName}</span>,
    },
    {
      key: "cost",
      header: "Cost",
      render: (r) => (
        <span className="tabular-nums">{formatPrice(Number(r.costPrice))}</span>
      ),
    },
    {
      key: "lead",
      header: "Lead time",
      render: (r) => <span className="tabular-nums">{r.leadTimeDays} days</span>,
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Product Suppliers"
        subtitle="Link products to suppliers"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Link
          </Button>
        }
      />
      <div className="mb-4 max-w-xs">
        <Label className="mb-2 block">Filter by product</Label>
        <Select
          value={productId}
          onValueChange={(v) => {
            setProductId(v);
            void loadForProduct(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
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
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.productName} ${r.supplierName}`}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link product ↔ supplier</DialogTitle>
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
            <div className="space-y-1">
              <Label>Supplier</Label>
              <Select
                value={form.supplierId}
                onValueChange={(v) => setForm((f) => ({ ...f, supplierId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Cost price</Label>
                <Input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Lead days</Label>
                <Input
                  type="number"
                  value={form.leadTimeDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leadTimeDays: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  await ProductSuppliersApi.create({
                    productId: Number(form.productId),
                    supplierId: Number(form.supplierId),
                    costPrice: Number(form.costPrice) || 0,
                    leadTimeDays: Number(form.leadTimeDays) || 0,
                  });
                  toast.success("Linked");
                  setOpen(false);
                  if (productId) await loadForProduct(productId);
                } catch (e) {
                  toast.error(getApiErrorMessage(e));
                }
              }}
            >
              Save
            </Button>
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
