import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Categories,
  Brands,
  AdminCategories as CategoriesApi,
  AdminBrands as BrandsApi,
  AdminCoupons as CouponsApi,
  AdminReviews as ReviewsApi,
  AdminPayments as PaymentsApi,
  AdminUsers as UsersApi,
  getApiErrorMessage,
} from "@/api/client";
import type {
  BrandResponse,
  CategoryResponse,
  CouponResponse,
  DiscountType,
  PaymentCallbackResponse,
  ReviewResponse,
  UserResponse,
} from "@/api/types";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader } from "../../components/admin-layout";
import { DataTable, Column } from "../../components/data-table";
import { RatingStars, PaymentStatusBadge } from "../../components/shared";
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

// ------------------------------ Categories -----------------------------------

export function AdminCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [name, setName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await Categories.listAll());
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    try {
      if (editing) {
        await CategoriesApi.update(editing.id, { name: name.trim() });
        toast.success("Category updated");
      } else {
        await CategoriesApi.create({ name: name.trim() });
        toast.success("Category created");
      }
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <div>
      <AdminHeader
        title="Categories"
        subtitle="Product category tree"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setName("");
              setOpen(true);
            }}
          >
            <Plus size={16} /> Add category
          </Button>
        }
      />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <div className="max-w-lg rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 pb-2 text-sm">
            <FolderTree size={16} className="text-muted-foreground" /> Catalog
          </div>
          <ul className="space-y-1 border-l pl-6">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent/40"
              >
                <span>
                  {c.name}
                  {c.parentId != null && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      parent #{c.parentId}
                    </span>
                  )}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      setEditing(c);
                      setName(c.name);
                      setOpen(true);
                    }}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={async () => {
                      try {
                        await CategoriesApi.remove(c.id);
                        toast.success(`Deleted ${c.name}`);
                        await load();
                      } catch (e) {
                        toast.error(getApiErrorMessage(e));
                      }
                    }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
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

// ------------------------------ Brands ---------------------------------------

export function AdminBrands() {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BrandResponse | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setBrands(await Brands.listAll());
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    try {
      if (editing) {
        await BrandsApi.update(editing.id, {
          name: name.trim(),
          logoUrl: logoUrl || null,
        });
        toast.success("Brand updated");
      } else {
        await BrandsApi.create({ name: name.trim(), logoUrl: logoUrl || null });
        toast.success("Brand created");
      }
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const columns: Column<BrandResponse>[] = [
    {
      key: "name",
      header: "Brand",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => <span className="text-sm">{r.name}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (r) => <span className="text-sm text-muted-foreground">{r.slug}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditing(r);
              setName(r.name);
              setLogoUrl(r.logoUrl ?? "");
              setOpen(true);
            }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await BrandsApi.remove(r.id);
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
        title="Brands"
        subtitle={`${brands.length} brands`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setName("");
              setLogoUrl("");
              setOpen(true);
            }}
          >
            <Plus size={16} /> Add brand
          </Button>
        }
      />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={brands}
          getRowId={(r) => r.id}
          searchKeys={(r) => r.name}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit brand" : "New brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Logo URL</Label>
              <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
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

// ------------------------------ Reviews --------------------------------------

export function AdminReviews() {
  const [rows, setRows] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void AdminReviewsApi();
  }, []);

  async function AdminReviewsApi() {
    setLoading(true);
    try {
      const page = await ReviewsApi.list({ size: 50, sort: "createdAt,desc" });
      setRows(page.content ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<ReviewResponse>[] = [
    {
      key: "user",
      header: "Reviewer",
      render: (r) => <span className="text-sm">{r.reviewerName}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => <RatingStars value={r.rating} />,
    },
    {
      key: "comment",
      header: "Comment",
      render: (r) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">{r.comment}</span>
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
      <AdminHeader title="Reviews" subtitle={`${rows.length} reviews`} />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.reviewerName} ${r.comment}`}
        />
      )}
    </div>
  );
}

// ------------------------------ Coupons --------------------------------------

export function AdminCoupons() {
  const [rows, setRows] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT" as DiscountType,
    discountValue: "10",
    minOrderValue: "0",
    usageLimit: "100",
    expiresAt: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const page = await CouponsApi.list({ size: 50 });
      setRows(page.content ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    try {
      await CouponsApi.create({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        usageLimit: Number(form.usageLimit) || undefined,
        expiresAt: new Date(form.expiresAt).toISOString(),
      });
      toast.success("Coupon created");
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const columns: Column<CouponResponse>[] = [
    {
      key: "code",
      header: "Code",
      render: (r) => <span className="font-mono text-sm">{r.code}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span className="text-sm">
          {r.discountType} {r.discountValue}
          {r.discountType === "PERCENT" ? "%" : ""}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      render: (r) => (
        <span className="text-sm tabular-nums">
          {r.usedCount}/{r.usageLimit ?? "∞"}
        </span>
      ),
    },
    {
      key: "exp",
      header: "Expires",
      render: (r) => (
        <span className="text-sm text-muted-foreground">{formatDate(r.expiresAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            try {
              await CouponsApi.remove(r.id);
              toast.success("Coupon deleted");
              await load();
            } catch (e) {
              toast.error(getApiErrorMessage(e));
            }
          }}
        >
          <Trash2 size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Coupons"
        subtitle={`${rows.length} coupons`}
        action={
          <Button
            onClick={() => {
              const d = new Date();
              d.setMonth(d.getMonth() + 1);
              setForm((f) => ({
                ...f,
                expiresAt: d.toISOString().slice(0, 16),
              }));
              setOpen(true);
            }}
          >
            <Plus size={16} /> Add coupon
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
          searchKeys={(r) => r.code}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, discountType: v as DiscountType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">PERCENT</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">FIXED_AMOUNT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountValue: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Min order</Label>
                <Input
                  type="number"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrderValue: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Usage limit</Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, usageLimit: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Expires at</Label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------ Payments -------------------------------------

export function AdminPayments() {
  const [rows, setRows] = useState<PaymentCallbackResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const page = await PaymentsApi.list({ size: 50, sort: "createdAt,desc" });
        setRows(page.content ?? []);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns: Column<PaymentCallbackResponse>[] = [
    {
      key: "id",
      header: "ID",
      render: (r) => <span>#{r.id}</span>,
    },
    {
      key: "order",
      header: "Order",
      render: (r) => <span className="text-sm">#{r.orderId}</span>,
    },
    {
      key: "provider",
      header: "Provider",
      render: (r) => <span className="text-sm">{r.provider}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <PaymentStatusBadge status={r.status} />,
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (r) => (
        <span className="tabular-nums">{formatPrice(Number(r.amount))}</span>
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
      <AdminHeader title="Payments" subtitle={`${rows.length} payments`} />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.id} ${r.orderId} ${r.transactionNo}`}
        />
      )}
    </div>
  );
}

// ------------------------------ Users ----------------------------------------

export function AdminUsers() {
  const [rows, setRows] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const page = await UsersApi.list({ size: 50 });
      setRows(page.content ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const columns: Column<UserResponse>[] = [
    {
      key: "user",
      header: "User",
      render: (r) => (
        <div>
          <p className="text-sm">{r.fullName || r.username}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (r) => (
        <span className="text-xs text-muted-foreground">{(r.roles ?? []).join(", ")}</span>
      ),
    },
    {
      key: "active",
      header: "Active",
      render: (r) => (
        <span className="text-sm">{r.isActive ? "Yes" : "No"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            try {
              await UsersApi.remove(r.id);
              toast.success("User deleted");
              await load();
            } catch (e) {
              toast.error(getApiErrorMessage(e));
            }
          }}
        >
          <Trash2 size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Users" subtitle={`${rows.length} users`} />
      {loading ? (
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={28} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.username} ${r.email} ${r.fullName}`}
        />
      )}
    </div>
  );
}
