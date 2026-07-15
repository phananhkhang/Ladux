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
import { formatPrice, formatDate, resolveMediaUrl } from "@/lib/format";
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
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [name, setName] = useState("");
  /** Public path from upload or existing category (e.g. /uploads/categories/...). */
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  /** Local object URL for immediate preview before/while uploading. */
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const resetForm = () => {
    setName("");
    setImageUrl(null);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (c: CategoryResponse) => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setEditing(c);
    setName(c.name);
    setImageUrl(c.imageUrl ?? null);
    setOpen(true);
  };

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ file ảnh");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    setUploading(true);
    try {
      const { url } = await CategoriesApi.uploadImage(file);
      setImageUrl(url);
      toast.success("Đã upload ảnh");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        imageUrl: imageUrl,
      };
      if (editing) {
        await CategoriesApi.update(editing.id, body);
        toast.success("Category updated");
      } else {
        await CategoriesApi.create(body);
        toast.success("Category created");
      }
      setOpen(false);
      resetForm();
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = localPreview || resolveMediaUrl(imageUrl) || "";

  return (
    <div>
      <AdminHeader
        title="Categories"
        subtitle="Product category tree"
        action={
          <Button onClick={openCreate}>
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
                <span className="flex min-w-0 items-center gap-2">
                  {c.imageUrl ? (
                    <img
                      src={resolveMediaUrl(c.imageUrl)}
                      alt=""
                      className="size-8 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                      —
                    </span>
                  )}
                  <span className="min-w-0 truncate">
                    {c.name}
                    {c.parentId != null && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        parent #{c.parentId}
                      </span>
                    )}
                  </span>
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => openEdit(c)}
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
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt=""
                    className="size-16 rounded-md border object-cover"
                  />
                ) : (
                  <span className="flex size-16 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                    No image
                  </span>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploading || saving}
                    onChange={(e) => void onPickImage(e.target.files?.[0])}
                  />
                  {uploading && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" /> Uploading…
                    </span>
                  )}
                  {imageUrl && !uploading && (
                    <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                      {imageUrl}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button disabled={saving || uploading} onClick={() => void save()}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
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
        });
        toast.success("Brand updated");
      } else {
        await BrandsApi.create({ name: name.trim() });
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

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultCouponExpiresLocal(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return toLocalDatetimeInput(d.toISOString());
}

const emptyCouponForm = {
  code: "",
  discountType: "PERCENT" as DiscountType,
  discountValue: "10",
  minOrderValue: "0",
  usageLimit: "100",
  expiresAt: "",
};

export function AdminCoupons() {
  const [rows, setRows] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponResponse | null>(null);
  const [form, setForm] = useState(emptyCouponForm);

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

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyCouponForm, expiresAt: defaultCouponExpiresLocal() });
    setOpen(true);
  };

  const openEdit = (r: CouponResponse) => {
    setEditing(r);
    // Backend requires expiresAt in the future — bump past/near-expiry dates for edit.
    const exp = new Date(r.expiresAt);
    const expiresAt =
      !Number.isNaN(exp.getTime()) && exp.getTime() > Date.now() + 60_000
        ? toLocalDatetimeInput(r.expiresAt)
        : defaultCouponExpiresLocal();
    setForm({
      code: r.code,
      discountType: r.discountType,
      discountValue: String(r.discountValue),
      minOrderValue: String(r.minOrderValue ?? 0),
      usageLimit: r.usageLimit != null ? String(r.usageLimit) : "",
      expiresAt,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) {
      toast.error("Code required");
      return;
    }
    if (!form.expiresAt) {
      toast.error("Expires at required");
      return;
    }
    const body = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue) || 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      expiresAt: new Date(form.expiresAt).toISOString(),
    };
    try {
      if (editing) {
        await CouponsApi.update(editing.id, body);
        toast.success("Coupon updated");
      } else {
        await CouponsApi.create(body);
        toast.success("Coupon created");
      }
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
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
            <Pencil size={14} />
          </Button>
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
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Coupons"
        subtitle={`${rows.length} coupons`}
        action={
          <Button onClick={openCreate}>
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
            <DialogTitle>{editing ? "Edit coupon" : "New coupon"}</DialogTitle>
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
            <Button onClick={() => void save()}>{editing ? "Save" : "Create"}</Button>
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

/** Seed role IDs from V3 mock data. */
const ROLE_OPTIONS = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "CUSTOMER" },
] as const;

function roleNamesToIds(roles: string[] | undefined): number[] {
  const set = new Set((roles ?? []).map((r) => r.toUpperCase()));
  return ROLE_OPTIONS.filter((o) => set.has(o.name)).map((o) => o.id);
}

export function AdminUsers() {
  const [rows, setRows] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    fullName: "",
    phone: "",
    isActive: true,
    roleIds: [2] as number[],
  });

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

  const openEdit = (r: UserResponse) => {
    setEditing(r);
    setForm({
      email: r.email ?? "",
      username: r.username ?? "",
      password: "",
      fullName: r.fullName ?? "",
      phone: r.phone ?? "",
      isActive: r.isActive,
      roleIds: roleNamesToIds(r.roles).length ? roleNamesToIds(r.roles) : [2],
    });
    setOpen(true);
  };

  const toggleRole = (roleId: number) => {
    setForm((f) => {
      const has = f.roleIds.includes(roleId);
      const roleIds = has ? f.roleIds.filter((id) => id !== roleId) : [...f.roleIds, roleId];
      return { ...f, roleIds };
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!form.email.trim() || !form.username.trim()) {
      toast.error("Email and username required");
      return;
    }
    if (form.roleIds.length === 0) {
      toast.error("Select at least one role");
      return;
    }
    try {
      await UsersApi.update(editing.id, {
        email: form.email.trim(),
        username: form.username.trim(),
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        fullName: form.fullName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        isActive: form.isActive,
        roleIds: form.roleIds,
      });
      toast.success("User updated");
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

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
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
            <Pencil size={14} />
          </Button>
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
        </div>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Full name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="09xxxxxxxx"
                />
              </div>
              <div className="space-y-1">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Leave blank to keep"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-3 pt-1">
                {ROLE_OPTIONS.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.roleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="size-4 rounded border-input"
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="size-4 rounded border-input"
              />
              Active account
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
