import type { ProductResponse } from "@/api/types";

/** Backend origin (no trailing slash). Empty = same origin / Vite proxy. */
const API_ORIGIN = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "").replace(
  /\/$/,
  "",
);

/**
 * Resolve product/media URLs from the API.
 * - Absolute http(s)/data URLs are kept as-is
 * - Relative paths like `/uploads/products/foo.jpg` are prefixed with API origin
 *   (empty origin works via Vite proxy on /uploads)
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_ORIGIN}${path}`;
}

export function formatPrice(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function discountPercent(
  basePrice: number,
  discountPrice: number | null | undefined,
): number | null {
  if (discountPrice == null || discountPrice <= 0 || basePrice <= 0) return null;
  return Math.round(((basePrice - discountPrice) / basePrice) * 100);
}

export function productDiscountPercent(p: {
  basePrice: number;
  discountPrice: number | null;
}): number | null {
  return discountPercent(p.basePrice, p.discountPrice);
}

/** Human labels for known laptop spec keys (products.specs JSON). */
export const SPEC_KEY_LABELS: Record<string, string> = {
  ram: "RAM",
  storage: "Ổ cứng",
  cpu: "CPU",
  gpu: "GPU",
  man_hinh: "Màn hình",
};

export function specKeyLabel(key: string): string {
  return SPEC_KEY_LABELS[key] ?? key;
}

/** Build a short one-line spec summary from JSON specs string. */
export function shortSpecFromSpecs(specs: string | null | undefined): string {
  if (!specs) return "";
  try {
    const obj = JSON.parse(specs) as Record<string, string>;
    return Object.values(obj).slice(0, 5).join(" · ");
  } catch {
    return specs.slice(0, 80);
  }
}

export function productImages(p: ProductResponse): string[] {
  const urls: string[] = [];
  if (p.thumbnail) {
    const t = resolveMediaUrl(p.thumbnail);
    if (t) urls.push(t);
  }
  for (const img of p.image ?? []) {
    const u = resolveMediaUrl(img.imageUrl);
    if (u && !urls.includes(u)) urls.push(u);
  }
  if (urls.length === 0) {
    urls.push("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80");
  }
  return urls;
}

export function formatAddress(a: {
  receiverName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
}): string {
  return `${a.receiverName} — ${a.street}, ${a.district}, ${a.city} (${a.phone})`;
}

export function isAdmin(roles: string[] | undefined | null): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => {
    const name = String(r ?? "")
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, "");
    return name === "ADMIN";
  });
}
