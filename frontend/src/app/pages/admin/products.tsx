import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ImagePlus,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  Products,
  Brands,
  Categories,
  AdminProducts as ProductsApi,
  getApiErrorMessage,
} from "@/api/client";
import type {
  BrandResponse,
  CategoryResponse,
  ProductImageResponse,
  ProductRequest,
  ProductResponse,
} from "@/api/types";
import { formatPrice, productImages, resolveMediaUrl } from "@/lib/format";
import { AdminHeader } from "../../components/admin-layout";
import { DataTable, Column } from "../../components/data-table";
import { StockBadge } from "../../components/shared";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
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

// ── SKU / slug (mirror backend SlugUtils) ─────────────────────────────────────

function toSlugLike(text: string): string {
  if (!text?.trim()) return "";
  let s = text.toLowerCase().trim().replace(/đ/g, "d");
  // Strip combining marks (Vietnamese diacritics)
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s;
}

/** Client-side SKU preview; backend still re-normalizes + ensures uniqueness. */
function skuFromName(name: string): string {
  const base = toSlugLike(name);
  if (!base) return "";
  return base.length > 40 ? base.slice(0, 40).replace(/-+$/, "") : base;
}

// ── Spec attributes (stored as JSON string in products.specs) ─────────────────

type SpecForm = {
  ram: string;
  storage: string;
  cpu: string;
  gpu: string;
  man_hinh: string;
};

const EMPTY_SPECS: SpecForm = {
  ram: "",
  storage: "",
  cpu: "",
  gpu: "",
  man_hinh: "",
};

const SPEC_FIELDS: { key: keyof SpecForm; label: string; placeholder: string }[] = [
  { key: "ram", label: "RAM", placeholder: "vd: 16GB" },
  { key: "storage", label: "Ổ cứng", placeholder: "vd: 512GB" },
  { key: "cpu", label: "CPU", placeholder: "vd: Intel i7-13700H" },
  { key: "gpu", label: "GPU", placeholder: "vd: RTX 4060" },
  { key: "man_hinh", label: "Màn hình", placeholder: "vd: 15.6 inch" },
];

function parseSpecs(raw: string | null | undefined): SpecForm {
  const out = { ...EMPTY_SPECS };
  if (!raw?.trim()) return out;
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    SPEC_FIELDS.forEach(({ key }) => {
      const v = obj[key];
      if (v != null && String(v).trim()) out[key] = String(v).trim();
    });
  } catch {
    /* ignore invalid JSON */
  }
  return out;
}

/** Build JSON for API — only include filled attributes. */
function specsToJson(specs: SpecForm): string | null {
  const obj: Record<string, string> = {};
  SPEC_FIELDS.forEach(({ key }) => {
    if (specs[key]?.trim()) obj[key] = specs[key].trim();
  });
  return Object.keys(obj).length ? JSON.stringify(obj) : null;
}

const emptyForm = {
  name: "",
  brandId: "",
  categoryId: "",
  basePrice: "",
  discountPrice: "",
  stockQuantity: "0",
  isActive: true,
};

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [specs, setSpecs] = useState<SpecForm>(EMPTY_SPECS);
  const [saving, setSaving] = useState(false);

  const [existingImages, setExistingImages] = useState<ProductImageResponse[]>([]);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, b, c] = await Promise.all([
        Products.list({ size: 50 }),
        Brands.listAll(),
        Categories.listAll(),
      ]);
      setProducts(p.content ?? []);
      setBrands(b);
      setCategories(c);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const clearPendingImages = () => {
    setPendingImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      brandId: brands[0] ? String(brands[0].id) : "",
      categoryId: categories[0] ? String(categories[0].id) : "",
    });
    setSpecs({ ...EMPTY_SPECS });
    setExistingImages([]);
    setThumbnailPath(null);
    clearPendingImages();
    setOpen(true);
  };

  const openEdit = (p: ProductResponse) => {
    setEditing(p);
    setForm({
      name: p.name,
      brandId: p.brand ? String(p.brand.id) : "",
      categoryId: p.category ? String(p.category.id) : "",
      basePrice: String(p.basePrice),
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : "",
      stockQuantity: String(p.stockQuantity),
      isActive: p.isActive,
    });
    setSpecs(parseSpecs(p.specs));
    setExistingImages(p.image ?? []);
    setThumbnailPath(p.thumbnail);
    clearPendingImages();
    setOpen(true);
  };

  const remove = async (p: ProductResponse) => {
    try {
      await ProductsApi.remove(p.id);
      toast.success(`Deleted ${p.name}`);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  /** Always a concrete SKU string when name is filled (create), or existing on edit. */
  const resolvedSku = useMemo(() => {
    if (editing?.sku) return editing.sku;
    return skuFromName(form.name);
  }, [editing, form.name]);

  const onPickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const next: PendingImage[] = [];
    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) {
        toast.error(`${file.name}: chỉ hỗ trợ JPG, PNG, WEBP, GIF`);
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (next.length) {
      setPendingImages((prev) => [...prev, ...next]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePending = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const removeExistingImage = async (imageId: number) => {
    if (!editing) return;
    try {
      await ProductsApi.removeImage(editing.id, imageId);
      const removed = existingImages.find((img) => img.id === imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      if (removed && thumbnailPath && removed.imageUrl === thumbnailPath) {
        setThumbnailPath(null);
      }
      toast.success("Đã xóa ảnh");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const save = async () => {
    if (!form.name.trim() || !form.brandId || !form.categoryId) {
      toast.error("Name, brand and category are required");
      return;
    }
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      toast.error("Base price must be greater than 0");
      return;
    }

    const sku = editing?.sku?.trim() || skuFromName(form.name.trim());
    if (!sku) {
      toast.error("Không tạo được SKU từ tên sản phẩm — hãy nhập tên hợp lệ");
      return;
    }

    const body: ProductRequest = {
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      // Always send a non-empty SKU so create never fails on blank SKU
      sku,
      name: form.name.trim(),
      basePrice: Number(form.basePrice),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stockQuantity: Number(form.stockQuantity) || 0,
      specs: specsToJson(specs),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editing) {
        await ProductsApi.update(editing.id, {
          ...body,
          thumbnail: thumbnailPath,
        });
        if (pendingImages.length > 0) {
          const uploaded = await ProductsApi.uploadImages(
            editing.id,
            pendingImages.map((p) => p.file),
          );
          if ((!thumbnailPath || !thumbnailPath.trim()) && uploaded[0]?.imageUrl) {
            setThumbnailPath(uploaded[0].imageUrl);
          }
        }
        toast.success("Product updated");
      } else {
        const created = await ProductsApi.create(body);
        if (pendingImages.length > 0) {
          await ProductsApi.uploadImages(
            created.id,
            pendingImages.map((p) => p.file),
          );
        }
        toast.success("Product created");
      }
      clearPendingImages();
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ProductResponse>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <ImageWithFallback
            src={productImages(r)[0]}
            alt={r.name}
            className="size-10 rounded-md object-cover"
          />
          <div>
            <p className="text-sm">{r.name}</p>
            <p className="text-xs text-muted-foreground">
              {r.sku} · {r.brand?.name} · {r.category?.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      sortValue: (r) => Number(r.discountPrice ?? r.basePrice),
      render: (r) => (
        <div className="tabular-nums">
          {formatPrice(Number(r.discountPrice ?? r.basePrice))}
          {r.discountPrice != null && (
            <span className="ml-1 text-xs text-muted-foreground line-through">
              {formatPrice(Number(r.basePrice))}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      sortValue: (r) => r.stockQuantity,
      render: (r) => <span className="tabular-nums">{r.stockQuantity}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StockBadge quantity={r.stockQuantity} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void remove(r)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const hasAnyImage =
    existingImages.length > 0 || pendingImages.length > 0 || !!thumbnailPath;

  return (
    <div>
      <AdminHeader
        title="Products"
        subtitle={loading ? "Loading…" : `${products.length} products`}
        action={
          <Button onClick={openNew}>
            <Plus size={16} /> Add product
          </Button>
        }
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={products}
          getRowId={(r) => r.id}
          searchKeys={(r) =>
            `${r.name} ${r.sku} ${r.brand?.name ?? ""} ${r.category?.name ?? ""}`
          }
          onRowClick={openEdit}
        />
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) clearPendingImages();
          setOpen(v);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Laptop Gaming ASUS TUF F15"
              />
            </Field>

            <Field
              label="SKU"
              hint={
                editing
                  ? "SKU được gán khi tạo và không đổi"
                  : "Tự sinh từ tên (giống slug) — backend đảm bảo không trùng"
              }
            >
              <Input
                value={resolvedSku || "— nhập tên để xem SKU —"}
                readOnly
                disabled
                className="font-mono text-sm text-muted-foreground"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand">
                <Select
                  value={form.brandId}
                  onValueChange={(v) => setForm((f) => ({ ...f, brandId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Category">
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Base price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                />
              </Field>
              <Field label="Discount">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountPrice: e.target.value }))
                  }
                />
              </Field>
              <Field label="Stock">
                <Input
                  type="number"
                  min={0}
                  value={form.stockQuantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stockQuantity: e.target.value }))
                  }
                />
              </Field>
            </div>

            {/* Structured specs as free-text fields (serialized to JSON for API) */}
            <div className="space-y-2">
              <div>
                <Label>Cấu hình</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Nhập thuộc tính — lưu dạng JSON tương thích storefront
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SPEC_FIELDS.map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <Input
                      value={specs[key]}
                      onChange={(e) =>
                        setSpecs((s) => ({ ...s, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                    />
                  </Field>
                ))}
              </div>
            </div>

            {/* Multi image upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label>Images</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tải nhiều ảnh. Ảnh đầu → thumbnail (
                    <code className="text-[10px]">/uploads/products/…</code>)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  Chọn ảnh
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => onPickFiles(e.target.files)}
                />
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPickFiles(e.dataTransfer.files);
                }}
                className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <ImagePlus className="text-muted-foreground" size={28} />
                <p className="text-sm text-muted-foreground">
                  Kéo thả hoặc bấm để chọn nhiều ảnh
                </p>
              </div>

              {thumbnailPath && (
                <p className="truncate text-xs text-muted-foreground">
                  Thumbnail:{" "}
                  <span className="font-mono text-foreground">{thumbnailPath}</span>
                </p>
              )}

              {hasAnyImage && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {thumbnailPath &&
                    !existingImages.some((img) => img.imageUrl === thumbnailPath) &&
                    pendingImages.length === 0 && (
                      <div className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                        <img
                          src={resolveMediaUrl(thumbnailPath)}
                          alt="Thumbnail"
                          className="size-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                          Thumb
                        </span>
                      </div>
                    )}

                  {existingImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                    >
                      <img
                        src={resolveMediaUrl(img.imageUrl)}
                        alt=""
                        className="size-full object-cover"
                      />
                      {(img.imageUrl === thumbnailPath ||
                        (!thumbnailPath && idx === 0)) && (
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                          Thumb
                        </span>
                      )}
                      <button
                        type="button"
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          void removeExistingImage(img.id);
                        }}
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {pendingImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-md border border-dashed border-primary/40 bg-muted"
                    >
                      <img
                        src={img.previewUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                      {!thumbnailPath &&
                        existingImages.length === 0 &&
                        idx === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                            Thumb
                          </span>
                        )}
                      <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Mới
                      </span>
                      <button
                        type="button"
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePending(img.id);
                        }}
                        aria-label="Remove pending image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                clearPendingImages();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void save()}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export { AdminProductsPage as AdminProducts };
