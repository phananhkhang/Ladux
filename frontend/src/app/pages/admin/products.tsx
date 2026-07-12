import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  ProductRequest,
  ProductResponse,
} from "@/api/types";
import { formatPrice, productImages } from "@/lib/format";
import { AdminHeader } from "../../components/admin-layout";
import { DataTable, Column } from "../../components/data-table";
import { StockBadge } from "../../components/shared";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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

const emptyForm = {
  name: "",
  sku: "",
  brandId: "",
  categoryId: "",
  basePrice: "",
  discountPrice: "",
  stockQuantity: "0",
  specs: "{}",
  thumbnail: "",
  isActive: true,
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const openNew = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      brandId: brands[0] ? String(brands[0].id) : "",
      categoryId: categories[0] ? String(categories[0].id) : "",
    });
    setOpen(true);
  };

  const openEdit = (p: ProductResponse) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      brandId: p.brand ? String(p.brand.id) : "",
      categoryId: p.category ? String(p.category.id) : "",
      basePrice: String(p.basePrice),
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : "",
      stockQuantity: String(p.stockQuantity),
      specs: p.specs ?? "{}",
      thumbnail: p.thumbnail ?? "",
      isActive: p.isActive,
    });
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

  const save = async () => {
    if (!form.name.trim() || !form.sku.trim() || !form.brandId || !form.categoryId) {
      toast.error("Name, SKU, brand and category are required");
      return;
    }
    const body: ProductRequest = {
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      sku: form.sku.trim(),
      name: form.name.trim(),
      basePrice: Number(form.basePrice),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stockQuantity: Number(form.stockQuantity) || 0,
      specs: form.specs || null,
      thumbnail: form.thumbnail || null,
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (editing) {
        await ProductsApi.update(editing.id, body);
        toast.success("Product updated");
      } else {
        await ProductsApi.create(body);
        toast.success("Product created");
      }
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
              {r.brand?.name} · {r.category?.name}
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
          searchKeys={(r) => `${r.name} ${r.sku} ${r.brand?.name ?? ""} ${r.category?.name ?? ""}`}
          onRowClick={openEdit}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="SKU">
              <Input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
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
                  value={form.basePrice}
                  onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                />
              </Field>
              <Field label="Discount">
                <Input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
                />
              </Field>
              <Field label="Stock">
                <Input
                  type="number"
                  value={form.stockQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Thumbnail URL">
              <Input
                value={form.thumbnail}
                onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
              />
            </Field>
            <Field label="Specs (JSON)">
              <Textarea
                rows={4}
                value={form.specs}
                onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// Keep export name used by App.tsx
export { AdminProductsPage as AdminProducts };
